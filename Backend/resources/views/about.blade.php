@extends('layouts.app')

@section('title', 'About Us | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">About Us</h1>
        <p class="text-xl">Discover our history, mission, and the people behind our success.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="grid grid-2 gap-4 mb-5">
        <div>
            <h2 class="mb-3">Our History</h2>
            <p>Founded in 1924, St. Augustine Academy began as a small community school with a profound vision: to deliver world-class education rooted in strong moral values. Over the past century, we have grown into a premier institution, nurturing tens of thousands of alumni who have gone on to make significant impacts globally.</p>
            <p>Our historic campus has evolved alongside modern advancements, seamlessly blending classic architecture with cutting-edge learning facilities.</p>
        </div>
        <div class="bg-light p-4 rounded">
            <h2 class="mb-3 text-primary">Mission & Vision</h2>
            <h4 class="mb-2">Our Mission</h4>
            <p class="mb-4">To inspire intellectual curiosity, foster personal growth, and empower students to become ethical leaders and global citizens.</p>
            <h4 class="mb-2">Our Vision</h4>
            <p>To be the leading educational institution recognized for academic excellence, innovation, and community service.</p>
        </div>
    </div>

    <hr class="my-5">

    <div class="leadership-section text-center">
        <h2 class="mb-4">Our Leadership</h2>
        <div class="grid grid-3 gap-4 text-left">
            <div class="card p-3">
                <div class="bg-secondary rounded mb-3" style="height: 250px;"></div>
                <h4 class="mb-1">Dr. Sarah Jenkins</h4>
                <p class="text-primary text-small mb-2">Principal</p>
                <p class="text-muted text-small">With over 20 years in education leadership, Dr. Jenkins brings a wealth of experience and a passion for student success.</p>
            </div>
            <div class="card p-3">
                <div class="bg-secondary rounded mb-3" style="height: 250px;"></div>
                <h4 class="mb-1">Mr. Robert Chen</h4>
                <p class="text-primary text-small mb-2">Vice Principal (Academics)</p>
                <p class="text-muted text-small">Mr. Chen oversees our rigorous curriculum, ensuring our academic standards remain among the highest in the state.</p>
            </div>
            <div class="card p-3">
                <div class="bg-secondary rounded mb-3" style="height: 250px;"></div>
                <h4 class="mb-1">Mrs. Elena Rodriguez</h4>
                <p class="text-primary text-small mb-2">Dean of Students</p>
                <p class="text-muted text-small">Dedicated to student welfare, Mrs. Rodriguez fosters a supportive and inclusive campus environment.</p>
            </div>
        </div>
    </div>
</div>
@endsection
