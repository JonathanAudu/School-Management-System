@extends('layouts.app')

@section('title', 'Admissions | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Admissions</h1>
        <p class="text-xl">Join our community. Your journey starts here.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="grid grid-2 gap-5">
        <div>
            <h2 class="mb-4">Admissions Process</h2>
            <ul class="process-list list-none">
                <li class="mb-3 d-flex">
                    <div class="badge bg-primary text-secondary mr-3 h-fit">1</div>
                    <div>
                        <h4>Submit Online Application</h4>
                        <p class="text-muted">Fill out our comprehensive online application form below.</p>
                    </div>
                </li>
                <li class="mb-3 d-flex">
                    <div class="badge bg-primary text-secondary mr-3 h-fit">2</div>
                    <div>
                        <h4>Entrance Examination</h4>
                        <p class="text-muted">Eligible candidates will be invited for an assessment test.</p>
                    </div>
                </li>
                <li class="mb-3 d-flex">
                    <div class="badge bg-primary text-secondary mr-3 h-fit">3</div>
                    <div>
                        <h4>Interview</h4>
                        <p class="text-muted">A brief interview with the student and parents.</p>
                    </div>
                </li>
                <li class="mb-3 d-flex">
                    <div class="badge bg-primary text-secondary mr-3 h-fit">4</div>
                    <div>
                        <h4>Offer & Enrollment</h4>
                        <p class="text-muted">Successful candidates receive an offer letter to formally enroll.</p>
                    </div>
                </li>
            </ul>

            <h2 class="mt-5 mb-4">Requirements & Fees</h2>
            <div class="bg-light p-4 rounded mb-4">
                <h4>General Requirements</h4>
                <ul class="ml-4 mt-2 mb-0">
                    <li>Completed Application Form</li>
                    <li>Previous Academic Transcripts (last 2 years)</li>
                    <li>Birth Certificate or Passport Copy</li>
                    <li>Two Recommendation Letters</li>
                </ul>
            </div>
            
            <div class="table-responsive">
                <table class="table w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-secondary text-white">
                            <th class="p-2 border">Grade Level</th>
                            <th class="p-2 border">Annual Tuition</th>
                            <th class="p-2 border">Other Fees</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="p-2 border">Middle School (Grades 6-8)</td>
                            <td class="p-2 border">$12,500</td>
                            <td class="p-2 border">$1,200</td>
                        </tr>
                        <tr>
                            <td class="p-2 border">High School (Grades 9-12)</td>
                            <td class="p-2 border">$14,000</td>
                            <td class="p-2 border">$1,500</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
        
        <div id="apply" class="apply-form-container bg-white p-5 rounded shadow border border-light">
            <h2 class="mb-4">Online Application Form</h2>
            <form action="#" method="POST" class="form">
                @csrf
                <div class="form-group mb-3">
                    <label class="d-block mb-1 font-bold">Student Full Name</label>
                    <input type="text" class="form-control w-full p-2 border rounded" placeholder="John Doe" required>
                </div>
                <div class="grid grid-2 gap-3 mb-3">
                    <div class="form-group">
                        <label class="d-block mb-1 font-bold">Date of Birth</label>
                        <input type="date" class="form-control w-full p-2 border rounded" required>
                    </div>
                    <div class="form-group">
                        <label class="d-block mb-1 font-bold">Grade Applying For</label>
                        <select class="form-control w-full p-2 border rounded" required>
                            <option value="">Select Grade</option>
                            <option value="6">Grade 6</option>
                            <option value="7">Grade 7</option>
                            <option value="8">Grade 8</option>
                            <option value="9">Grade 9</option>
                            <option value="10">Grade 10</option>
                            <option value="11">Grade 11</option>
                            <option value="12">Grade 12</option>
                        </select>
                    </div>
                </div>
                <div class="form-group mb-3">
                    <label class="d-block mb-1 font-bold">Parent/Guardian Name</label>
                    <input type="text" class="form-control w-full p-2 border rounded" placeholder="Jane Doe" required>
                </div>
                <div class="grid grid-2 gap-3 mb-3">
                    <div class="form-group">
                        <label class="d-block mb-1 font-bold">Email Address</label>
                        <input type="email" class="form-control w-full p-2 border rounded" placeholder="jane@example.com" required>
                    </div>
                    <div class="form-group">
                        <label class="d-block mb-1 font-bold">Phone Number</label>
                        <input type="tel" class="form-control w-full p-2 border rounded" placeholder="(555) 123-4567" required>
                    </div>
                </div>
                <div class="form-group mb-4">
                    <label class="d-block mb-1 font-bold">Additional Comments</label>
                    <textarea class="form-control w-full p-2 border rounded" rows="4" placeholder="Any special requirements or questions..."></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full">Submit Application</button>
            </form>
        </div>
    </div>
</div>
@endsection
