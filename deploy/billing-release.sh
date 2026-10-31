#!/bin/sh
set -eu
revision="$1"
owner="$2"
case "$revision" in *[!a-f0-9]*|'') exit 1 ;; esac
test "${#revision}" = 40
release="/home/u246888667/247url-billing-$revision"
done_file="/home/u246888667/247url-release-backups/$revision/complete"
if [ -f "$done_file" ]; then echo 'Billing release already complete.'; exit 0; fi
if [ ! -d "$release/.git" ]; then
    mkdir -p "$release"
    git -C "$release" init -q
    git -C "$release" remote add origin https://github.com/trtayebee089/url-shortner.git
fi
git -C "$release" fetch --depth 1 origin "$revision"
git -C "$release" checkout --detach FETCH_HEAD
test "$(git -C "$release" rev-parse HEAD)" = "$revision"
/usr/bin/php "$release/deploy/billing-release.php" /home/u246888667/domains/247.bd/public_html/api "$owner" "$revision"

cd /home/u246888667/domains/247.bd/public_html/api
/usr/bin/php artisan config:clear
/usr/bin/php artisan route:clear
/usr/bin/php artisan migrate --force
/usr/bin/php artisan optimize
/usr/bin/php artisan admin:provision "$owner" --create
printf '%s\n' 'Release complete' > "$done_file"
/usr/bin/php artisan admin:provision "$owner" --send-reset
