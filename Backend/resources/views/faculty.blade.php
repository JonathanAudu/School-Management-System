@extends('layouts.app')

@section('title', 'Faculty & Staff | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Faculty & Staff Directory</h1>
        <p class="text-xl">Meet the dedicated professionals shaping our students' futures.</p>
    </div>
</div>

<div class="container section-padding">
    <!-- Filters (Visual only for now) -->
    <div class="d-flex justify-content-center mb-5 gap-3 flex-wrap">
        <button class="btn btn-primary">All</button>
        <button class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Administration</button>
        <button class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Science Dept</button>
        <button class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Arts & Humanities</button>
        <button class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Athletics</button>
    </div>

    <!-- Faculty Grid -->
    <div class="grid grid-4 gap-4">
        <!-- Faculty Member 1 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Prof. Alan Turing</h4>
            <p class="text-primary text-small font-bold mb-2">Head of Computer Science</p>
            <p class="text-muted text-small mb-3">Ph.D. in Computer Science, MIT.</p>
            <a href="mailto:aturing@staugustine.edu" class="text-small text-secondary font-bold hover-primary">aturing@staugustine.edu</a>
        </div>
        <!-- Faculty Member 2 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Dr. Marie Curie</h4>
            <p class="text-primary text-small font-bold mb-2">Lead Chemistry Teacher</p>
            <p class="text-muted text-small mb-3">Ph.D. in Chemistry, Sorbonne.</p>
            <a href="mailto:mcurie@staugustine.edu" class="text-small text-secondary font-bold hover-primary">mcurie@staugustine.edu</a>
        </div>
        <!-- Faculty Member 3 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Mr. William Shakespeare</h4>
            <p class="text-primary text-small font-bold mb-2">Literature Instructor</p>
            <p class="text-muted text-small mb-3">M.A. in English Literature, Oxford.</p>
            <a href="mailto:wshakes@staugustine.edu" class="text-small text-secondary font-bold hover-primary">wshakes@staugustine.edu</a>
        </div>
        <!-- Faculty Member 4 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Ms. Serena Williams</h4>
            <p class="text-primary text-small font-bold mb-2">Athletics Director</p>
            <p class="text-muted text-small mb-3">B.S. in Sports Science.</p>
            <a href="mailto:swilliams@staugustine.edu" class="text-small text-secondary font-bold hover-primary">swilliams@staugustine.edu</a>
        </div>
        <!-- Faculty Member 5 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Mr. Leonardo da Vinci</h4>
            <p class="text-primary text-small font-bold mb-2">Fine Arts Teacher</p>
            <p class="text-muted text-small mb-3">MFA, Florence Academy of Art.</p>
            <a href="mailto:ldavinci@staugustine.edu" class="text-small text-secondary font-bold hover-primary">ldavinci@staugustine.edu</a>
        </div>
        <!-- Faculty Member 6 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Dr. Albert Einstein</h4>
            <p class="text-primary text-small font-bold mb-2">Physics Teacher</p>
            <p class="text-muted text-small mb-3">Ph.D. in Physics, UZH.</p>
            <a href="mailto:aeinstein@staugustine.edu" class="text-small text-secondary font-bold hover-primary">aeinstein@staugustine.edu</a>
        </div>
        <!-- Faculty Member 7 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Mrs. Jane Austen</h4>
            <p class="text-primary text-small font-bold mb-2">History Teacher</p>
            <p class="text-muted text-small mb-3">M.A. in History.</p>
            <a href="mailto:jausten@staugustine.edu" class="text-small text-secondary font-bold hover-primary">jausten@staugustine.edu</a>
        </div>
        <!-- Faculty Member 8 -->
        <div class="card p-3 text-center transition hover-shadow">
            <div class="rounded-circle mx-auto mb-3" style="width: 120px; height: 120px; background: #cbd5e1;"></div>
            <h4 class="mb-1">Mr. Pythagoras</h4>
            <p class="text-primary text-small font-bold mb-2">Mathematics Instructor</p>
            <p class="text-muted text-small mb-3">Ph.D. in Mathematics.</p>
            <a href="mailto:pythagoras@staugustine.edu" class="text-small text-secondary font-bold hover-primary">pythagoras@staugustine.edu</a>
        </div>
    </div>
</div>
@endsection
