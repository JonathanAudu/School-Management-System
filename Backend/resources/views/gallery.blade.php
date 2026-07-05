@extends('layouts.app')

@section('title', 'Gallery | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Campus Gallery</h1>
        <p class="text-xl">A visual tour of our vibrant school community.</p>
    </div>
</div>

<div class="container section-padding">
    <!-- Gallery Grid -->
    <div class="gallery-grid">
        <!-- Placeholder Images -->
        <a href="#img1" class="gallery-item" style="background: #e2e8f0; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
        <a href="#img2" class="gallery-item" style="background: #cbd5e1; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
        <a href="#img3" class="gallery-item" style="background: #94a3b8; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
        <a href="#img4" class="gallery-item" style="background: #64748b; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
        <a href="#img5" class="gallery-item" style="background: #475569; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
        <a href="#img6" class="gallery-item" style="background: #334155; height: 250px; border-radius: var(--radius); display: block; overflow: hidden; position: relative;">
            <div class="overlay d-flex justify-content-center align-items-center w-full h-full bg-secondary text-white" style="opacity: 0; transition: var(--transition); position: absolute; top: 0; left: 0;">
                <span>View Full Size</span>
            </div>
        </a>
    </div>

    <!-- Simple CSS Lightboxes -->
    <div class="lightbox" id="img1">
        <a href="#!" class="close-btn">&times;</a>
        <div class="lightbox-content" style="width: 80%; height: 80%; background: #e2e8f0; margin: auto;"></div>
    </div>
    <div class="lightbox" id="img2">
        <a href="#!" class="close-btn">&times;</a>
        <div class="lightbox-content" style="width: 80%; height: 80%; background: #cbd5e1; margin: auto;"></div>
    </div>
    <!-- Add more lightboxes as needed based on the logic -->
</div>

<style>
    .gallery-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
    }
    .gallery-item:hover .overlay {
        opacity: 0.8 !important;
    }
    
    .lightbox {
        display: none;
        position: fixed;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9);
        z-index: 1000;
    }
    .lightbox:target {
        display: flex;
    }
    .lightbox .close-btn {
        position: absolute;
        top: 2rem; right: 3rem;
        color: white; font-size: 3rem; text-decoration: none;
    }
</style>
@endsection
