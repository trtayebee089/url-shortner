<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AbuseReport extends Model
{
    protected $fillable = ['link_id', 'short_code', 'reporter_email', 'reason', 'details', 'status'];
}
