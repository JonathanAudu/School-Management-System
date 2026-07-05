@extends('layouts.app')

@section('title', 'Contact Us | St. Augustine Academy')

@section('content')
<div class="page-header" style="background-image: linear-gradient(rgba(15, 23, 42, 0.8), rgba(15, 23, 42, 0.8)), url('/images/hero.png');">
    <div class="container text-center text-white pt-5 pb-5">
        <h1 class="text-4xl mt-5">Contact Us</h1>
        <p class="text-xl">We're here to answer any questions you may have.</p>
    </div>
</div>

<div class="container section-padding">
    <div class="grid grid-2 gap-5 mb-5">
        <!-- Contact Information -->
        <div>
            <h2 class="mb-4">Get In Touch</h2>
            <p class="text-muted mb-4">Whether you are a prospective parent, a community member, or an alum, we welcome you to reach out to us. Our administrative team is available during standard school hours.</p>
            
            <div class="d-flex align-items-start mb-4">
                <div class="icon-wrapper bg-light text-primary mr-3" style="width: 50px; height: 50px; flex-shrink: 0; font-size: 1.5rem;">📍</div>
                <div>
                    <h4 class="mb-1">Our Address</h4>
                    <p class="text-muted mb-0">123 Education Blvd,<br>Cityville, ST 12345<br>United States</p>
                </div>
            </div>
            
            <div class="d-flex align-items-start mb-4">
                <div class="icon-wrapper bg-light text-primary mr-3" style="width: 50px; height: 50px; flex-shrink: 0; font-size: 1.5rem;">📞</div>
                <div>
                    <h4 class="mb-1">Phone Number</h4>
                    <p class="text-muted mb-0">Main Office: +1 (555) 123-4567<br>Admissions: +1 (555) 123-4568</p>
                </div>
            </div>
            
            <div class="d-flex align-items-start mb-4">
                <div class="icon-wrapper bg-light text-primary mr-3" style="width: 50px; height: 50px; flex-shrink: 0; font-size: 1.5rem;">✉️</div>
                <div>
                    <h4 class="mb-1">Email Addresses</h4>
                    <p class="text-muted mb-0">General: contact@staugustine.edu<br>Admissions: admissions@staugustine.edu</p>
                </div>
            </div>

            <div class="d-flex align-items-start">
                <div class="icon-wrapper bg-light text-primary mr-3" style="width: 50px; height: 50px; flex-shrink: 0; font-size: 1.5rem;">🕒</div>
                <div>
                    <h4 class="mb-1">Office Hours</h4>
                    <p class="text-muted mb-0">Monday - Friday: 8:00 AM - 4:30 PM<br>Saturday - Sunday: Closed</p>
                </div>
            </div>
        </div>

        <!-- Contact Form -->
        <div class="bg-light p-5 rounded">
            <h3 class="mb-4">Send Us a Message</h3>
            <form action="#" method="POST">
                @csrf
                <div class="form-group mb-3">
                    <label class="d-block mb-1 font-bold">Your Name</label>
                    <input type="text" class="form-control w-full p-2 border rounded" required>
                </div>
                <div class="form-group mb-3">
                    <label class="d-block mb-1 font-bold">Email Address</label>
                    <input type="email" class="form-control w-full p-2 border rounded" required>
                </div>
                <div class="form-group mb-3">
                    <label class="d-block mb-1 font-bold">Subject</label>
                    <select class="form-control w-full p-2 border rounded" required>
                        <option value="">Select a Topic</option>
                        <option value="admissions">Admissions Inquiry</option>
                        <option value="academics">Academic Question</option>
                        <option value="employment">Employment Opportunity</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <div class="form-group mb-4">
                    <label class="d-block mb-1 font-bold">Message</label>
                    <textarea class="form-control w-full p-2 border rounded" rows="5" required></textarea>
                </div>
                <button type="submit" class="btn btn-primary btn-lg w-full">Send Message</button>
            </form>
        </div>
    </div>
</div>

<!-- Google Map (Placeholder iframe) -->
<div class="w-full bg-secondary" style="height: 400px; overflow: hidden;">
    <!-- For a real project, insert actual Google Maps iframe here -->
    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d193595.15830869428!2d-74.11976397304603!3d40.69766374874431!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x89c24fa5d33f083b%3A0xc80b8f06e177fe62!2sNew%20York%2C%20NY%2C%20USA!5e0!3m2!1sen!2s!4v1683226296181!5m2!1sen!2s" width="100%" height="450" style="border:0; margin-top: -50px;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>
@endsection
