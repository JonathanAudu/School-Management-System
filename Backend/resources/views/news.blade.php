@extends('layouts.app')

@section('title', 'News & Events | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">News & Events</h1>
        <p class="text-xl">Stay updated with the latest happenings on campus.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="grid grid-3 gap-5">
        <!-- Main News Column (2/3 width) -->
        <div class="col-span-2" style="grid-column: span 2;">
            <h2 class="mb-4">Latest News</h2>
            
            <div class="card mb-4 overflow-hidden border-0 shadow-sm d-flex flex-row">
                <div style="width: 200px; background: #e2e8f0; flex-shrink: 0;"></div>
                <div class="p-4">
                    <span class="category text-primary text-small font-bold">Academics</span>
                    <h3 class="mt-2 mb-2"><a href="#" class="hover-primary">Science Fair Winners Announced</a></h3>
                    <p class="text-muted text-small mb-3">Published: Oct 15, 2026</p>
                    <p class="mb-3 text-muted">Our students showcased incredible innovation at the annual state science fair, taking home three gold medals in physics and environmental science...</p>
                    <a href="#" class="font-bold" style="color: var(--secondary);">Read More &rarr;</a>
                </div>
            </div>

            <div class="card mb-4 overflow-hidden border-0 shadow-sm d-flex flex-row">
                <div style="width: 200px; background: #cbd5e1; flex-shrink: 0;"></div>
                <div class="p-4">
                    <span class="category text-primary text-small font-bold">Sports</span>
                    <h3 class="mt-2 mb-2"><a href="#" class="hover-primary">Varsity Basketball Team Secures Championship</a></h3>
                    <p class="text-muted text-small mb-3">Published: Oct 12, 2026</p>
                    <p class="mb-3 text-muted">A thrilling final match resulted in a historic win for the Lions. The team demonstrated outstanding teamwork and perseverance throughout the season...</p>
                    <a href="#" class="font-bold" style="color: var(--secondary);">Read More &rarr;</a>
                </div>
            </div>
            
            <div class="card mb-4 overflow-hidden border-0 shadow-sm d-flex flex-row">
                <div style="width: 200px; background: #94a3b8; flex-shrink: 0;"></div>
                <div class="p-4">
                    <span class="category text-primary text-small font-bold">Community</span>
                    <h3 class="mt-2 mb-2"><a href="#" class="hover-primary">Annual Charity Drive Raises Record Funds</a></h3>
                    <p class="text-muted text-small mb-3">Published: Oct 08, 2026</p>
                    <p class="mb-3 text-muted">The student council led a successful campaign to support local shelters, raising over $15,000 in just two weeks thanks to generous community support...</p>
                    <a href="#" class="font-bold" style="color: var(--secondary);">Read More &rarr;</a>
                </div>
            </div>

            <!-- Pagination (Placeholder) -->
            <div class="d-flex gap-2 mt-4">
                <button class="btn btn-primary px-3 py-1">1</button>
                <button class="btn btn-outline px-3 py-1" style="color: var(--secondary); border-color: var(--border);">2</button>
                <button class="btn btn-outline px-3 py-1" style="color: var(--secondary); border-color: var(--border);">3</button>
                <button class="btn btn-outline px-3 py-1" style="color: var(--secondary); border-color: var(--border);">Next &rarr;</button>
            </div>
        </div>

        <!-- Sidebar (1/3 width) -->
        <div>
            <!-- Categories -->
            <div class="card p-4 mb-4">
                <h4 class="mb-3">Categories</h4>
                <ul class="list-none m-0 p-0 text-muted">
                    <li class="mb-2 pb-2 border-bottom"><a href="#" class="hover-primary d-flex justify-content-between">All News <span>(45)</span></a></li>
                    <li class="mb-2 pb-2 border-bottom"><a href="#" class="hover-primary d-flex justify-content-between">Academics <span>(12)</span></a></li>
                    <li class="mb-2 pb-2 border-bottom"><a href="#" class="hover-primary d-flex justify-content-between">Sports <span>(18)</span></a></li>
                    <li class="mb-2 pb-2 border-bottom"><a href="#" class="hover-primary d-flex justify-content-between">Community <span>(9)</span></a></li>
                    <li><a href="#" class="hover-primary d-flex justify-content-between">Alumni <span>(6)</span></a></li>
                </ul>
            </div>

            <!-- Upcoming Events Sidebar -->
            <div class="card p-4">
                <h4 class="mb-3">Upcoming Events</h4>
                <div class="mb-3 pb-3 border-bottom">
                    <p class="font-bold mb-1">Fall Open House</p>
                    <p class="text-small text-muted mb-0">Oct 24, 2026 • 09:00 AM</p>
                </div>
                <div class="mb-3 pb-3 border-bottom">
                    <p class="font-bold mb-1">Halloween Student Festival</p>
                    <p class="text-small text-muted mb-0">Oct 31, 2026 • 04:00 PM</p>
                </div>
                <div>
                    <p class="font-bold mb-1">Parent-Teacher Conferences</p>
                    <p class="text-small text-muted mb-0">Nov 05, 2026 • 08:00 AM</p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
    @media(max-width: 768px) {
        .d-flex.flex-row {
            flex-direction: column !important;
        }
        .d-flex.flex-row > div:first-child {
            width: 100% !important;
            height: 200px;
        }
        .col-span-2 {
            grid-column: span 1 !important;
        }
    }
</style>
@endsection
