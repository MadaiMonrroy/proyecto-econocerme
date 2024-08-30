<template>
    <div class="gradient-bg">
      <svg viewBox="0 0 100vw 100vw" xmlns="http://www.w3.org/2000/svg" class="noiseBg">
        <filter id="noiseFilterBg">
          <feTurbulence type="fractalNoise" baseFrequency="0.6" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" preserveAspectRatio="xMidYMid meet" filter="url(#noiseFilterBg)" />
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" class="svgBlur">
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
      <div class="gradients-container">
        <div class="g1"></div>
        <div class="g2"></div>
        <div class="g3"></div>
        <div class="g4"></div>
        <div class="g5"></div>
        <div class="interactive"></div>
      </div>
    </div>
  </template>
  
  <script >
  export default {
    name: "BackgroundEffect",
    mounted() {
      const interBubble = document.querySelector(".interactive");
      let curX = 0;
      let curY = 0;
      let tgX = 0;
      let tgY = 0;
  
      const move = () => {
        curX += (tgX - curX) / 20;
        curY += (tgY - curY) / 20;
        interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
        requestAnimationFrame(move);
      };
  
      window.addEventListener("mousemove", (event) => {
        tgX = event.clientX;
        tgY = event.clientY;
      });
  
      move();
    },
  };
  </script>
  
  <style scoped>
  @import url("https://fonts.googleapis.com/css?family=Montserrat:400,700");
  
  :root {
    --color-bg1: rgb(8, 10, 15);
    --color-bg2: rgb(0, 17, 32);
    --color1: 18, 113, 255;
    --color2: 107, 74, 255;
    --color3: 100, 100, 255;
    --color4: 50, 160, 220;
    --color5: 80, 47, 122;
    --color-interactive: 140, 100, 255;
    --circle-size: 80%;
    --blending: hard-light;
  }
  
  * {
    margin: 0;
    padding: 0;
    outline: none;
    list-style: none;
    text-decoration: none;
    box-sizing: border-box;
    color: #fff;
    background: transparent;
    border: none;
  }
  
  html,
  body {
    font-family: "Dongle", sans-serif;
    margin: 0;
    padding: 0;
    height: 100%;
    width: 100%;
  }
  
  body {
    background: #fff;
    font-family: "Montserrat", sans-serif;
    overflow: hidden;
  }
  
  h1,
  h2,
  h3 {
    font-family: "Montserrat", sans-serif;
    font-weight: 700;
  }
  
  .gradient-bg {
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    background: linear-gradient(40deg, var(--color-bg1), var(--color-bg2));
    top: 0;
    left: 0;
  }
  
  .gradient-bg .svgBlur {
    display: none;
  }
  
  .gradient-bg .noiseBg {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    z-index: 1;
    mix-blend-mode: soft-light;
    opacity: 0.3;
  }
  
  .gradient-bg .gradients-container {
    filter: url(#goo) blur(40px);
    width: 100%;
    height: 100%;
  }
  
  .gradient-bg .g1,
  .gradient-bg .g2,
  .gradient-bg .g3,
  .gradient-bg .g4,
  .gradient-bg .g5,
  .gradient-bg .interactive {
    position: absolute;
    mix-blend-mode: var(--blending);
    width: var(--circle-size);
    height: var(--circle-size);
    opacity: 1;
  }
  
  .gradient-bg .g1 {
    background: radial-gradient(circle at center, rgba(var(--color1), 0.8) 0, rgba(var(--color1), 0) 50%) no-repeat;
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: center center;
    animation: moveVertical 30s ease infinite;
  }
  
  .gradient-bg .g2 {
    background: radial-gradient(circle at center, rgba(var(--color2), 0.8) 0, rgba(var(--color2), 0) 50%) no-repeat;
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: calc(50% - 400px);
    animation: moveInCircle 20s reverse infinite;
  }
  
  .gradient-bg .g3 {
    background: radial-gradient(circle at center, rgba(var(--color3), 0.8) 0, rgba(var(--color3), 0) 50%) no-repeat;
    top: calc(50% - var(--circle-size) / 2 + 200px);
    left: calc(50% - var(--circle-size) / 2 - 500px);
    transform-origin: calc(50% + 400px);
    animation: moveInCircle 40s linear infinite;
  }
  
  .gradient-bg .g4 {
    background: radial-gradient(circle at center, rgba(var(--color4), 0.8) 0, rgba(var(--color4), 0) 50%) no-repeat;
    top: calc(50% - var(--circle-size) / 2);
    left: calc(50% - var(--circle-size) / 2);
    transform-origin: calc(50% - 200px);
    animation: moveHorizontal 40s ease infinite;
    opacity: 0.7;
  }
  
  .gradient-bg .g5 {
    background: radial-gradient(circle at center, rgba(var(--color5), 0.8) 0, rgba(var(--color5), 0) 50%) no-repeat;
    width: calc(var(--circle-size) * 2);
    height: calc(var(--circle-size) * 2);
    top: calc(50% - var(--circle-size));
    left: calc(50% - var(--circle-size));
    transform-origin: calc(50% - 800px) calc(50% + 200px);
    animation: moveInCircle 20s ease infinite;
  }
  
  .gradient-bg .interactive {
    background: radial-gradient(circle at center, rgba(var(--color-interactive), 0.8) 0, rgba(var(--color-interactive), 0) 50%) no-repeat;
    width: 100%;
    height: 100%;
    top: -50%;
    left: -50%;
    opacity: 0.7;
  }
  
  @keyframes moveInCircle {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  @keyframes moveVertical {
    0% {
      transform: translateY(-50%);
    }
    50% {
      transform: translateY(50%);
    }
    100% {
      transform: translateY(-50%);
    }
  }
  
  @keyframes moveHorizontal {
    0% {
      transform: translateX(-50%) translateY(-10%);
    }
    50% {
      transform: translateX(50%) translateY(10%);
    }
    100% {
      transform: translateX(-50%) translateY(-10%);
  }
    }  </style>
  