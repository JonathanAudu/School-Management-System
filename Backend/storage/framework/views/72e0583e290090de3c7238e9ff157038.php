<?php $__env->startSection('title', 'Home | St. Augustine Academy'); ?>
<?php $__env->startSection('body_class', 'home-page'); ?>

<?php $__env->startSection('content'); ?>
    <!-- Hero Section -->
    <section class="hero" style="background-image: linear-gradient(rgba(15, 23, 42, 0.7), rgba(15, 23, 42, 0.4)), url('/images/hero.png');">
        <div class="container hero-content">
            <span class="badge">Est. 1924 • Shaping the Future</span>
            <h1 class="hero-title">Empowering Minds,<br>Inspiring Excellence.</h1>
            <p class="hero-subtitle">Discover a world-class education where tradition meets innovation. Join a community dedicated to your success.</p>
            <div class="hero-cta">
                <a href="<?php echo e(url('/academics')); ?>" class="btn btn-primary btn-lg">Explore Programs</a>
                <a href="<?php echo e(url('/gallery')); ?>" class="btn btn-outline btn-lg">Virtual Tour</a>
            </div>
        </div>
    </section>

    <!-- About Summary Section -->
    <section class="about-summary section-padding">
        <div class="container about-grid">
            <div class="about-text">
                <h2>Welcome to St. Augustine Academy</h2>
                <h3 class="text-primary mb-3">A Legacy of Excellence Since 1924</h3>
                <p>For over a century, St. Augustine Academy has been at the forefront of holistic education, nurturing students to become critical thinkers, compassionate leaders, and lifelong learners.</p>
                <p>Our dedicated faculty, state-of-the-art facilities, and diverse curriculum ensure that every student is equipped to thrive in an ever-changing global landscape.</p>
                <a href="<?php echo e(url('/about')); ?>" class="btn btn-outline mt-3" style="color: var(--secondary); border-color: var(--secondary);">Read Our Story</a>
            </div>
            <div class="about-image-stack">
                <div class="img-box img-front">
                    <!-- Placeholder color for image -->
                    <div style="width: 100%; height: 100%; background: var(--border); border-radius: var(--radius); display: flex; align-items: center; justify-content: center; font-size: 3rem;">🏫</div>
                </div>
                <div class="img-box img-back">
                    <div style="width: 100%; height: 100%; background: var(--primary); border-radius: var(--radius); opacity: 0.8;"></div>
                </div>
            </div>
        </div>
    </section>

    <!-- Quick Stats -->
    <section class="quick-stats bg-secondary text-white py-5">
        <div class="container">
            <div class="stats-grid grid-4">
                <div class="stat-item text-center">
                    <div class="stat-number">1,200+</div>
                    <div class="stat-label">Students Enrolled</div>
                </div>
                <div class="stat-item text-center">
                    <div class="stat-number">150+</div>
                    <div class="stat-label">Expert Faculty</div>
                </div>
                <div class="stat-item text-center">
                    <div class="stat-number">98%</div>
                    <div class="stat-label">College Acceptance</div>
                </div>
                <div class="stat-item text-center">
                    <div class="stat-number">40+</div>
                    <div class="stat-label">Extracurricular Clubs</div>
                </div>
            </div>
        </div>
    </section>

    <!-- Latest News -->
    <section class="latest-news section-padding bg-light">
        <div class="container">
            <div class="section-header d-flex justify-content-between align-items-end mb-5">
                <div>
                    <h2>Latest News</h2>
                    <p class="text-muted">Stay updated with the latest happenings at our academy.</p>
                </div>
                <a href="<?php echo e(url('/news')); ?>" class="btn btn-outline" style="color: var(--secondary); border-color: var(--secondary);">View All News</a>
            </div>
            <div class="news-grid grid-3">
                <!-- News Card 1 -->
                <div class="card news-card">
                    <div class="card-img" style="height: 200px; background: #e2e8f0;"></div>
                    <div class="card-body">
                        <span class="category text-primary text-small">Academics</span>
                        <h3 class="mt-2 mb-2"><a href="#">Science Fair Winners Announced</a></h3>
                        <p class="text-muted text-small mb-3">Oct 15, 2026</p>
                        <p>Our students showcased incredible innovation at the annual state science fair...</p>
                    </div>
                </div>
                <!-- News Card 2 -->
                <div class="card news-card">
                    <div class="card-img" style="height: 200px; background: #cbd5e1;"></div>
                    <div class="card-body">
                        <span class="category text-primary text-small">Sports</span>
                        <h3 class="mt-2 mb-2"><a href="#">Varsity Basketball Team Secures Championship</a></h3>
                        <p class="text-muted text-small mb-3">Oct 12, 2026</p>
                        <p>A thrilling final match resulted in a historic win for the Lions...</p>
                    </div>
                </div>
                <!-- News Card 3 -->
                <div class="card news-card">
                    <div class="card-img" style="height: 200px; background: #94a3b8;"></div>
                    <div class="card-body">
                        <span class="category text-primary text-small">Community</span>
                        <h3 class="mt-2 mb-2"><a href="#">Annual Charity Drive Raises Record Funds</a></h3>
                        <p class="text-muted text-small mb-3">Oct 08, 2026</p>
                        <p>The student council led a successful campaign to support local shelters...</p>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Upcoming Events -->
    <section class="upcoming-events section-padding">
        <div class="container">
            <div class="section-header text-center mb-5">
                <h2>Upcoming Events</h2>
                <p class="text-muted">Don't miss out on what's happening on campus.</p>
            </div>
            <div class="events-list max-w-4xl mx-auto">
                <!-- Event 1 -->
                <div class="event-item d-flex align-items-center mb-4 p-4 border rounded hover-shadow transition">
                    <div class="event-date text-center pr-4 border-right mr-4" style="min-width: 100px;">
                        <span class="d-block text-primary font-bold text-2xl">24</span>
                        <span class="text-uppercase text-muted text-small">Oct</span>
                    </div>
                    <div class="event-details flex-grow">
                        <h4 class="mb-1">Fall Open House</h4>
                        <p class="text-muted text-small mb-0">⏱ 09:00 AM - 02:00 PM | 📍 Main Campus</p>
                    </div>
                    <div class="event-action pl-4">
                        <a href="#" class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Details</a>
                    </div>
                </div>
                <!-- Event 2 -->
                <div class="event-item d-flex align-items-center mb-4 p-4 border rounded hover-shadow transition">
                    <div class="event-date text-center pr-4 border-right mr-4" style="min-width: 100px;">
                        <span class="d-block text-primary font-bold text-2xl">31</span>
                        <span class="text-uppercase text-muted text-small">Oct</span>
                    </div>
                    <div class="event-details flex-grow">
                        <h4 class="mb-1">Halloween Student Festival</h4>
                        <p class="text-muted text-small mb-0">⏱ 04:00 PM - 08:00 PM | 📍 Student Quad</p>
                    </div>
                    <div class="event-action pl-4">
                        <a href="#" class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Details</a>
                    </div>
                </div>
                <!-- Event 3 -->
                <div class="event-item d-flex align-items-center mb-4 p-4 border rounded hover-shadow transition">
                    <div class="event-date text-center pr-4 border-right mr-4" style="min-width: 100px;">
                        <span class="d-block text-primary font-bold text-2xl">05</span>
                        <span class="text-uppercase text-muted text-small">Nov</span>
                    </div>
                    <div class="event-details flex-grow">
                        <h4 class="mb-1">Parent-Teacher Conferences</h4>
                        <p class="text-muted text-small mb-0">⏱ 08:00 AM - 03:00 PM | 📍 Academic Block</p>
                    </div>
                    <div class="event-action pl-4">
                        <a href="#" class="btn btn-outline" style="color: var(--secondary); border-color: var(--border);">Details</a>
                    </div>
                </div>
            </div>
            <div class="text-center mt-4">
                <a href="<?php echo e(url('/news')); ?>" class="btn btn-primary">View Full Calendar</a>
            </div>
        </div>
    </section>

<?php $__env->stopSection(); ?>

<?php echo $__env->make('layouts.app', array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?><?php /**PATH /Users/macbook/Desktop/Personal Work/School-work/Backend/resources/views/welcome.blade.php ENDPATH**/ ?>