
<template>
  <div class="cyberpunk-home">
    <!-- Header -->
    <header class="cyberpunk-header">
      <h1 class="logo">Pokemon TCG</h1>
      <nav>
        <a v-for="link in headerLinks" :key="link.url" :href="link.url" class="cyberpunk-link">{{ link.name }}</a>
      </nav>
    </header>

    <!-- Hero -->
    <section class="cyberpunk-hero">
      <h2 class="hero-title">Welcome to the Pokémon TCG Marketplace!</h2>
      <p class="hero-subtitle">Your one-stop shop to buy and sell Pokémon cards.</p>
      <a href="/register" class="cyberpunk-cta">Get Started</a>
    </section>

    <!-- Features -->
    <section class="cyberpunk-features">
      <h3 class="section-title">Why Choose Us?</h3>
      <div class="features-list">
        <div v-for="item in features" :key="item.title" class="feature-item">
          <span :class="['feature-icon', 'icon-' + item.icon]" />
          <h4>{{ item.title }}</h4>
          <p>{{ item.description }}</p>
        </div>
      </div>
    </section>

    <!-- Testimonials -->
    <section class="cyberpunk-testimonials">
      <h3 class="section-title">What Our Users Say</h3>
      <div class="testimonials-list">
        <blockquote v-for="item in testimonials" :key="item.author" class="testimonial-item">
          <p class="testimonial-quote">“{{ item.quote }}”</p>
          <footer class="testimonial-author">— {{ item.author }}</footer>
        </blockquote>
      </div>
    </section>

    <!-- Call To Action -->
    <section class="cyberpunk-cta-section">
      <h3>{{ callToAction.title }}</h3>
      <p>{{ callToAction.subtitle }}</p>
      <a :href="callToAction.cta.url" class="cyberpunk-cta">{{ callToAction.cta.text }}</a>
    </section>

    <!-- Footer -->
    <footer class="cyberpunk-footer">
      <span>{{ footerText }}</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
const headerLinks = [
  { name: 'Home', url: '/' },
  { name: 'Catalog', url: '/catalog' },
  { name: 'Login', url: '/login' },
  { name: 'Register', url: '/register' }
]

const features = [
  {
    title: 'Huge Collection',
    description: `Find any card you're looking for, from common to ultra-rare.`,
    icon: 'search'
  },
  {
    title: 'Secure Transactions',
    description: 'Buy and sell with confidence with our secure payment system.',
    icon: 'lock'
  },
  {
    title: 'Community Driven',
    description: 'Connect with other collectors and traders.',
    icon: 'users'
  }
]

const testimonials = [
  {
    quote: 'I found the last card I needed for my collection here! The process was so easy.',
    author: 'Ash K.'
  },
  {
    quote: 'Selling my duplicate cards was a breeze. I got a great price for them.',
    author: 'Misty W.'
  },
  {
    quote: 'The community is super friendly and helpful. I love trading here!',
    author: 'Brock S.'
  },
  {
    quote: 'Fast shipping and secure payments. Highly recommended!',
    author: 'Erika T.'
  },
  {
    quote: 'Great selection and easy to use. My go-to for Pokémon cards.',
    author: 'Gary O.'
  },
  {
    quote: 'I was able to complete my set thanks to this marketplace!',
    author: 'Sabrina L.'
  }
]

const callToAction = {
  title: 'Ready to start your collection?',
  subtitle: 'Join our community of Pokémon TCG enthusiasts today!',
  cta: {
    text: 'Sign Up Now',
    url: '/register'
  }
}

const footerText = '© 2025 Pokemon TCG'
</script>


<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Poppins:wght@600;700;800;900&display=swap');
@import '../styles/theme.css';

:global(html, body) {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  box-sizing: border-box;
}

:global(body) {
  margin: 0;
}

.cyberpunk-home {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  overflow-x: hidden;
  width: 100%;
  box-sizing: border-box;
}

.cyberpunk-header {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2.5rem;
  height: 90px;
  min-height: 90px;
  background: #1e293b;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.2);
  border-bottom: 1.5px solid #334155;
  position: sticky;
  top: 0;
  z-index: 10;
  box-sizing: border-box;
}

@keyframes headerGradientMove {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.logo {
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  color: #cbd5e1;
  background: none;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 0.2rem;
  text-decoration: none;
  font-weight: 500;
  text-transform: none;
  letter-spacing: -0.2px;
  transition: color 0.18s;
  position: relative;
}
.cyberpunk-link::after {
  content: '';
  display: block;
  width: 0%;
  height: 2.5px;
  background: #00d4ff;
  border-radius: 2px;
  margin: 0.18em auto 0 auto;
  transition: width 0.22s cubic-bezier(.4,0,.2,1);
}
.cyberpunk-link:hover {
  color: #00d4ff;
}
.cyberpunk-link:hover::after {
  width: 100%;
}
.cyberpunk-header nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cyberpunk-hero {
  margin: 2rem 0 3rem 0;
  text-align: center;
  max-width: 800px;
  padding: 0 2rem;
}
.hero-title {
  font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif;
  font-size: 3.2rem;
  font-weight: 800;
  color: #f1f5f9;
  line-height: 1.1;
  margin-bottom: 1rem;
  text-shadow: none;
  letter-spacing: -1px;
}
.hero-subtitle {
  font-size: 1.25rem;
  color: #94a3b8;
  font-weight: 400;
  margin: 1rem 0 2rem 0;
  text-shadow: none;
  line-height: 1.6;
  letter-spacing: -0.2px;
}
.cyberpunk-cta {
  display: inline-block;
  background: #00d4ff;
  color: #fff;
  font-weight: 600;
  font-size: 1.05rem;
  padding: 1rem 2.5rem;
  border-radius: 0.75rem;
  text-decoration: none;
  letter-spacing: -0.2px;
  margin-top: 1rem;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
}
.cyberpunk-cta:hover {
  background: #0ea5e9;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
}

.cyberpunk-features {
  width: 100%;
  max-width: 1000px;
  margin: 2rem auto 2rem auto;
  padding: 2rem 2rem;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-sizing: border-box;
}
.section-title {
  font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif;
  text-align: center;
  font-size: 2.2rem;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0;
  margin-bottom: 2rem;
  text-shadow: none;
  letter-spacing: -0.5px;
}
.features-list {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
}
.feature-item {
  background: #0f172a;
  border: 2px solid #334155;
  border-radius: 1rem;
  padding: 1.5rem 1.2rem;
  min-width: 250px;
  max-width: 280px;
  flex: 1 1 250px;
  text-align: center;
  color: #e2e8f0;
  transition: border-color 0.2s, transform 0.15s, box-shadow 0.2s;
  box-sizing: border-box;
}
.feature-item:hover {
  border-color: #00d4ff;
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 212, 255, 0.25);
}
.feature-icon {
  display: block;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #00d4ff;
  text-shadow: none;
}
.icon-search::before { content: '🔍'; }
.icon-lock::before { content: '🔒'; }
.icon-users::before { content: '👥'; }

.cyberpunk-testimonials {
  width: 100%;
  max-width: 1000px;
  margin: 2rem auto 2rem auto;
  padding: 2rem 2rem;
  background: #0f172a;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-sizing: border-box;
}
.testimonials-list {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  gap: 1.2rem;
  overflow-x: auto;
  width: 100%;
  max-width: 900px;
  box-sizing: border-box;
  padding-bottom: 0.5rem;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE y Edge */
}
.testimonials-list::-webkit-scrollbar {
  display: none;
}
.testimonial-item {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.8rem;
  padding: 1rem 1.1rem;
  min-width: 210px;
  max-width: 220px;
  color: #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.16);
  transition: transform 0.15s, box-shadow 0.2s;
  flex: 0 0 auto;
  margin: 0;
}
.testimonial-quote {
  font-size: 1.1rem;
  color: #cbd5e1;
  margin-bottom: 1rem;
  text-shadow: none;
  font-style: italic;
  line-height: 1.6;
}
.testimonial-author {
  font-size: 0.95rem;
  color: #94a3b8;
  text-align: right;
  text-shadow: none;
  font-weight: 600;
}

.cyberpunk-cta-section {
  margin: 2rem auto 2rem auto;
  text-align: center;
  background: #1e293b;
  border-radius: 1rem;
  border: 1px solid #334155;
  padding: 2rem 2rem;
  max-width: 1000px;
  width: 100%;
  box-sizing: border-box;
}
.cyberpunk-cta-section h3 {
  color: #f1f5f9;
  font-family: 'Poppins', 'Inter', 'Segoe UI', Arial, sans-serif;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.8rem;
  text-shadow: none;
  letter-spacing: -0.5px;
}
.cyberpunk-cta-section p {
  color: #94a3b8;
  font-size: 1.2rem;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

.cyberpunk-footer {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 2rem 0 1.5rem 0;
  background: #1e293b;
  color: #94a3b8;
  font-size: 0.95rem;
  border-top: 1px solid #334155;
  margin-top: auto;
  box-sizing: border-box;
}
</style>
