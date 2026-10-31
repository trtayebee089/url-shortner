<?php

// CLI-only release runner. Run from a reviewed, immutable checkout outside public_html.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$root = realpath($argv[1] ?? '');
$email = $argv[2] ?? '';
$release = $argv[3] ?? '';
if ($root !== '/home/u246888667/domains/247.bd/public_html/api' || !filter_var($email, FILTER_VALIDATE_EMAIL) || !preg_match('/^[a-f0-9]{40}$/', $release)) {
    fwrite(STDERR, "Invalid release target or arguments.\n"); exit(1);
}
$source = dirname(__DIR__).'/backend';
$backup = '/home/u246888667/247url-release-backups/'.$release;
if (!is_dir($backup)) { mkdir($backup, 0700, true); }
$lock = fopen($backup.'/lock', 'c');
if (!flock($lock, LOCK_EX | LOCK_NB)) { exit(0); }
if (is_file($backup.'/complete')) { echo "Release already complete.\n"; exit(0); }

require $root.'/vendor/autoload.php';
$app = require $root.'/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();
$pdo = Illuminate\Support\Facades\DB::connection()->getPdo();
if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) !== 'mysql') { throw new RuntimeException('Expected production MySQL.'); }

// Back up schema and rows before any migration; credentials never leave the application.
if (!is_file($backup.'/database.sql')) {
    $out = fopen($backup.'/database.sql.partial', 'wb'); chmod($backup.'/database.sql.partial', 0600);
    fwrite($out, "SET FOREIGN_KEY_CHECKS=0;\n");
    $pdo->beginTransaction();
    try {
        $tables = $pdo->query('SHOW FULL TABLES WHERE Table_type = \'BASE TABLE\'')->fetchAll(PDO::FETCH_COLUMN);
        foreach ($tables as $table) {
            $quoted = '`'.str_replace('`', '``', $table).'`';
            $ddl = $pdo->query('SHOW CREATE TABLE '.$quoted)->fetch(PDO::FETCH_NUM)[1];
            fwrite($out, $ddl.";\n");
            $rows = $pdo->query('SELECT * FROM '.$quoted);
            while ($row = $rows->fetch(PDO::FETCH_ASSOC)) {
                $columns = implode(',', array_map(fn($name) => '`'.str_replace('`', '``', $name).'`', array_keys($row)));
                $values = implode(',', array_map(fn($value) => $value === null ? 'NULL' : $pdo->quote((string)$value), array_values($row)));
                fwrite($out, 'INSERT INTO '.$quoted.' ('.$columns.') VALUES ('.$values.");\n");
            }
        }
        $pdo->commit();
        fwrite($out, "SET FOREIGN_KEY_CHECKS=1;\n-- BACKUP COMPLETE\n"); fclose($out);
        rename($backup.'/database.sql.partial', $backup.'/database.sql');
    } catch (Throwable $e) { if ($pdo->inTransaction()) {$pdo->rollBack();} fclose($out); throw $e; }
}
$files = json_decode(file_get_contents(__DIR__.'/billing-backend-files.json'), true, 512, JSON_THROW_ON_ERROR);
foreach ($files as $file) {
    if (!preg_match('#^(app|bootstrap|config|routes|database/migrations)/[A-Za-z0-9_/.-]+\.php$#', $file) || str_contains($file, '..') || !is_file($source.'/'.$file)) { throw new RuntimeException('Invalid release manifest.'); }
    $target = $root.'/'.$file;
    if (is_file($target) && !is_file($backup.'/code/'.$file)) { @mkdir(dirname($backup.'/code/'.$file), 0700, true); copy($target, $backup.'/code/'.$file); }
    @mkdir(dirname($target), 0755, true);
    copy($source.'/'.$file, $target.'.release');
    rename($target.'.release', $target);
}
$run = function (array $args) use ($root) {
    $command = escapeshellarg(PHP_BINARY).' '.escapeshellarg($root.'/artisan').' '.implode(' ', array_map('escapeshellarg', $args));
    passthru($command, $code);
    if ($code !== 0) { throw new RuntimeException('Release command failed: '.$args[0]); }
};
chdir($root);
$run(['config:clear']);
$run(['route:clear']);
$run(['migrate', '--force']);
$run(['optimize']);
$run(['admin:provision', $email, '--create']);
file_put_contents($backup.'/complete', date(DATE_ATOM));
echo "Billing release complete; Stripe disabled by default.\n";
// Mail delivery failure must not repeat deployment or reset an existing password.
$run(['admin:provision', $email, '--send-reset']);
