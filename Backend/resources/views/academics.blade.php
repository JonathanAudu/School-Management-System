@extends('layouts.app')

@section('title', 'Academics | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Academics</h1>
        <p class="text-xl">A rigorous curriculum designed for the innovators of tomorrow.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="mb-5 text-center max-w-4xl mx-auto">
        <h2>Our Curriculum Overview</h2>
        <p class="text-muted">We offer a broad, balanced, and challenging curriculum that prepares students for higher education and beyond. Our academic programs are structured to develop critical thinking, creativity, and a love for continuous learning.</p>
    </div>

    <div class="grid grid-2 gap-5 mb-5">
        <div class="card p-4">
            <h3 class="mb-3 text-primary">Middle School (Grades 6-8)</h3>
            <p>The Middle School years are crucial for developing foundational skills. We focus on interdisciplinary learning, encouraging students to make connections across different subjects.</p>
            <h5 class="mt-3 mb-2">Core Subjects:</h5>
            <ul class="ml-4 text-muted">
                <li>Mathematics (Pre-Algebra, Algebra I)</li>
                <li>Sciences (Earth, Life, Physical)</li>
                <li>Language Arts & Literature</li>
                <li>World History & Geography</li>
            </ul>
        </div>
        <div class="card p-4">
            <h3 class="mb-3 text-primary">High School (Grades 9-12)</h3>
            <p>High School students are offered a rigorous college-preparatory curriculum. With Advanced Placement (AP) courses and diverse electives, students can tailor their education to their interests.</p>
            <h5 class="mt-3 mb-2">Core & Advanced Subjects:</h5>
            <ul class="ml-4 text-muted">
                <li>AP Calculus & Statistics</li>
                <li>AP Physics, Chemistry & Biology</li>
                <li>AP English Literature & Composition</li>
                <li>Foreign Languages (Spanish, French, Mandarin)</li>
            </ul>
        </div>
    </div>

    <hr class="my-5">

    <div class="mb-5">
        <h2 class="text-center mb-4">Academic Calendar (2026 - 2027)</h2>
        <div class="table-responsive">
            <table class="table w-full text-left border-collapse bg-white shadow-sm">
                <thead>
                    <tr class="bg-secondary text-white">
                        <th class="p-3 border">Term / Event</th>
                        <th class="p-3 border">Start Date</th>
                        <th class="p-3 border">End Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="p-3 border font-bold">Fall Semester Begins</td>
                        <td class="p-3 border">September 1, 2026</td>
                        <td class="p-3 border">-</td>
                    </tr>
                    <tr>
                        <td class="p-3 border font-bold">Thanksgiving Break</td>
                        <td class="p-3 border">November 25, 2026</td>
                        <td class="p-3 border">November 29, 2026</td>
                    </tr>
                    <tr>
                        <td class="p-3 border font-bold">Winter Break</td>
                        <td class="p-3 border">December 18, 2026</td>
                        <td class="p-3 border">January 4, 2027</td>
                    </tr>
                    <tr>
                        <td class="p-3 border font-bold">Spring Semester Begins</td>
                        <td class="p-3 border">January 5, 2027</td>
                        <td class="p-3 border">-</td>
                    </tr>
                    <tr>
                        <td class="p-3 border font-bold">Spring Break</td>
                        <td class="p-3 border">March 22, 2027</td>
                        <td class="p-3 border">March 26, 2027</td>
                    </tr>
                    <tr>
                        <td class="p-3 border font-bold">End of Academic Year</td>
                        <td class="p-3 border">June 15, 2027</td>
                        <td class="p-3 border">-</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
@endsection
