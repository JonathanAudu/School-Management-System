<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/about', function () {
    return view('about');
});

Route::get('/admissions', function () {
    return view('admissions');
});

Route::get('/academics', function () {
    return view('academics');
});

Route::get('/faculty', function () {
    return view('faculty');
});

Route::get('/student-life', function () {
    return view('student-life');
});

Route::get('/gallery', function () {
    return view('gallery');
});

Route::get('/news', function () {
    return view('news');
});

Route::get('/contact', function () {
    return view('contact');
});
