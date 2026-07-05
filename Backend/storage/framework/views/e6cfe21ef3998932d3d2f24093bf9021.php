<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $__env->yieldContent('title', 'St. Augustine Academy | Excellence in Education'); ?></title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,600;1,600&display=swap" rel="stylesheet">
    
    <!-- Vite Assets -->
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.js']); ?>
</head>
<body class="<?php echo $__env->yieldContent('body_class'); ?>">
    <!-- Navbar -->
    <header class="navbar">
        <div class="container nav-container">
            <a href="<?php echo e(url('/')); ?>" class="logo">
                <span class="logo-icon">🏛️</span>
                <span class="logo-text">St. Augustine<br><small>Academy</small></span>
            </a>
            
            <!-- Mobile Menu Toggle -->
            <button class="mobile-toggle" id="mobile-toggle" aria-label="Toggle Menu">
                <span></span>
                <span></span>
                <span></span>
            </button>

            <nav class="nav-links" id="nav-links">
                <a href="<?php echo e(url('/')); ?>">Home</a>
                <a href="<?php echo e(url('/about')); ?>">About Us</a>
                <a href="<?php echo e(url('/admissions')); ?>">Admissions</a>
                <a href="<?php echo e(url('/academics')); ?>">Academics</a>
                <a href="<?php echo e(url('/student-life')); ?>">Student Life</a>
                <a href="<?php echo e(url('/news')); ?>">News & Events</a>
                <a href="<?php echo e(url('/contact')); ?>">Contact Us</a>
            </nav>
            <div class="nav-actions">
                <a href="<?php echo e(url('/admissions#apply')); ?>" class="btn btn-primary">Apply Now</a>
            </div>
        </div>
    </header>

    <main>
        <?php echo $__env->yieldContent('content'); ?>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="container footer-grid">
            <div class="footer-brand">
                <a href="<?php echo e(url('/')); ?>" class="logo logo-light">
                    <span class="logo-icon">🏛️</span>
                    <span class="logo-text">St. Augustine<br><small>Academy</small></span>
                </a>
                <p>Empowering the next generation of leaders through excellence in education.</p>
            </div>
            <div class="footer-links">
                <h4>Quick Links</h4>
                <ul>
                    <li><a href="<?php echo e(url('/about')); ?>">About Us</a></li>
                    <li><a href="<?php echo e(url('/academics')); ?>">Academics</a></li>
                    <li><a href="<?php echo e(url('/admissions')); ?>">Admissions</a></li>
                    <li><a href="<?php echo e(url('/faculty')); ?>">Faculty Directory</a></li>
                    <li><a href="<?php echo e(url('/gallery')); ?>">Gallery</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h4>Contact Us</h4>
                <p>123 Education Blvd, Cityville<br>contact@staugustine.edu<br>+1 (555) 123-4567</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; <?php echo e(date('Y')); ?> St. Augustine Academy. All rights reserved.</p>
        </div>
    </footer>

    <!-- Mobile Menu Script -->
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const toggle = document.getElementById('mobile-toggle');
            const nav = document.getElementById('nav-links');
            
            toggle.addEventListener('click', () => {
                nav.classList.toggle('active');
                toggle.classList.toggle('open');
            });
        });
    </script>
</body>
</html>
<?php /**PATH /Users/macbook/Desktop/Personal Work/School-work/school-landing/resources/views/layouts/app.blade.php ENDPATH**/ ?>