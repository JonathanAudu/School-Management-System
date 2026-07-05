@extends('layouts.app')

@section('title', 'Student Life | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Student Life</h1>
        <p class="text-xl">Beyond the classroom: exploring passions, building character.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="mb-5 text-center max-w-4xl mx-auto">
        <h2>Clubs & Organizations</h2>
        <p class="text-muted">With over 40 active student-run clubs, there's a community for every interest at St. Augustine.</p>
    </div>

    <div class="grid grid-3 gap-4 mb-5">
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">🗣️</div>
            <h4>Debate Club</h4>
            <p class="text-muted text-small">Develop critical thinking and public speaking skills.</p>
        </div>
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">🤖</div>
            <h4>Robotics Team</h4>
            <p class="text-muted text-small">Design, build, and program competitive robots.</p>
        </div>
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">🎭</div>
            <h4>Drama Society</h4>
            <p class="text-muted text-small">Put on two major theatrical productions each year.</p>
        </div>
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">📰</div>
            <h4>School Newspaper</h4>
            <p class="text-muted text-small">Report on campus events and student opinions.</p>
        </div>
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">🌱</div>
            <h4>Eco-Warriors</h4>
            <p class="text-muted text-small">Promote sustainability and environmental awareness.</p>
        </div>
        <div class="card p-4 hover-shadow transition text-center">
            <div class="icon-wrapper mx-auto bg-light text-primary mb-3">🎨</div>
            <h4>Art Collective</h4>
            <p class="text-muted text-small">Explore various mediums and host art exhibitions.</p>
        </div>
    </div>

    <hr class="my-5">

    <div class="grid grid-2 gap-5 mb-5 align-items-center">
        <div>
            <h2 class="mb-3">Athletics & Sports</h2>
            <p>Our athletics program focuses on teamwork, discipline, and physical well-being. We offer seasonal sports including:</p>
            <ul class="ml-4 mt-2 mb-4 text-muted">
                <li><strong>Fall:</strong> Soccer, Volleyball, Cross Country</li>
                <li><strong>Winter:</strong> Basketball, Swimming, Wrestling</li>
                <li><strong>Spring:</strong> Track & Field, Baseball, Tennis</li>
            </ul>
            <a href="#" class="btn btn-outline" style="color: var(--secondary); border-color: var(--secondary);">View Athletics Schedule</a>
        </div>
        <div class="bg-secondary rounded p-5 text-center text-white">
            <h3 class="mb-3">Recent Achievements</h3>
            <div class="mb-3">
                <p class="font-bold text-primary mb-0">State Champions 2026</p>
                <p class="text-small">Varsity Basketball Team</p>
            </div>
            <div class="mb-3">
                <p class="font-bold text-primary mb-0">1st Place Regional</p>
                <p class="text-small">Science Olympiad Team</p>
            </div>
            <div>
                <p class="font-bold text-primary mb-0">Gold Medal</p>
                <p class="text-small">National High School Choral Festival</p>
            </div>
        </div>
    </div>
</div>
@endsection
