import React, { useRef, useEffect } from 'react';

const DraggableBall = () => {
  const canvasRef = useRef(null);
  const playerRef = useRef(null); // Reference to the YouTube player
  const videoId = 'o3ODR4Tk5ZE';
  useEffect(() => {
    // Initialize the YouTube player API
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        events: {
          onStateChange: handlePlayerStateChange
        }
      });
    };

    // Load the YouTube IFrame Player API script
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(script);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const canvasWidth = window.innerWidth - 4;
    const canvasHeight = window.innerHeight - 4;
    const dragAccelFactor = 0.05; // Define drag acceleration factor here
    // Set canvas width and height
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const gravity = { x: 0, y: 0.1 };
    const ground = canvasHeight;
    const bounce = 0.9;

    let object = {
      pos: { x: canvasWidth / 2, y: 0 },
      vel: { x: 0, y: 0 },
      size: { w: 10, h: 10 },
      isDragging: false,
      mouseOffset: { x: 0, y: 0 },
      prevMousePos: { x: 0, y: 0 }, // Initialize prevMousePos here
      update() {
        if (this.isDragging) return; // Do not update position if dragging
        this.vel.x += gravity.x;
        this.vel.y += gravity.y;
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        const g = ground - this.size.h;
        if (this.pos.y >= g) {
          this.pos.y = g - (this.pos.y - g);
          this.vel.y = -Math.abs(this.vel.y) * bounce;
          if (this.vel.y >= -gravity.y) {
            this.vel.y = 0;
            this.pos.y = g - gravity.y;
          }
          // if (playerRef.current && playerRef.current.getPlayerState() === window.YT.PlayerState.PLAYING) {
          //   playerRef.current.pauseVideo(); // Pause the video when hitting the ground
          // }
        }

        // Check for collision with top, left, and right boundaries
        if (this.pos.y <= 0 || this.pos.x <= 0 || this.pos.x + this.size.w >= canvas.width) {
          if (playerRef.current) {
            const playerState = playerRef.current.getPlayerState();
            if (playerState === window.YT.PlayerState.PAUSED || playerState === window.YT.PlayerState.ENDED) {
              playerRef.current.playVideo(); // Play the video when hitting the edges
            } else {
              playerRef.current.pauseVideo(); // Pause the video when hitting the edges
            }
          }
          if (this.pos.y <= 0) { // Top boundary
            this.vel.y = Math.abs(this.vel.y) * bounce;
            this.pos.y = 0;
          }
          if (this.pos.x <= 0) { // Left boundary
            this.vel.x = Math.abs(this.vel.x) * bounce;
            this.pos.x = 0;
          }
          if (this.pos.x + this.size.w >= canvas.width) { // Right boundary
            this.vel.x = -Math.abs(this.vel.x) * bounce;
            this.pos.x = canvas.width - this.size.w;
          }
        }
      },
      draw() {
        ctx.fillRect(this.pos.x, this.pos.y, this.size.w, this.size.h);
      },
      startDragging(event) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (mouseX >= this.pos.x && mouseX <= this.pos.x + this.size.w &&
            mouseY >= this.pos.y && mouseY <= this.pos.y + this.size.h) {
            this.isDragging = true;
            this.mouseOffset.x = event.clientX - rect.left - this.pos.x;
            this.mouseOffset.y = event.clientY - rect.top - this.pos.y;
            this.prevMousePos.x = event.clientX;
            this.prevMousePos.y = event.clientY;
        }
      },
      stopDragging() {
        this.isDragging = false;
      },
      moveWithMouse(event) {
        if (this.isDragging) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX;
          const mouseY = event.clientY;
          
          // Calculate velocity based on the change in mouse position
          const deltaX = mouseX - this.prevMousePos.x;
          const deltaY = mouseY - this.prevMousePos.y;

          // Calculate the direction of dragging
          const directionX = Math.sign(deltaX);
          const directionY = Math.sign(deltaY);

          // Adjust the velocity based on the direction of dragging
          this.vel.x += Math.abs(deltaX) * dragAccelFactor * directionX;
          this.vel.y += Math.abs(deltaY) * dragAccelFactor * directionY;

          // Update previous mouse position
          this.prevMousePos.x = mouseX;
          this.prevMousePos.y = mouseY;

          // Update object position
          this.pos.x = mouseX - rect.left - this.mouseOffset.x;
          this.pos.y = mouseY - rect.top - this.mouseOffset.y;

          // Ensure object stays within canvas bounds
          this.pos.x = Math.max(0, Math.min(canvasWidth - this.size.w, this.pos.x));
          this.pos.y = Math.max(0, Math.min(canvasHeight - this.size.h, this.pos.y));
        }
      }
    };

    const handlePlayerStateChange = (event) => {
      if (event.data === window.YT.PlayerState.PLAYING) {
        console.log('Video is playing');
      }
    };

    const mainLoop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      object.update();
      object.draw();
      // Draw canvas border
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      ctx.strokeRect(1, 1, canvasWidth - 2, canvasHeight - 2);
      requestAnimationFrame(mainLoop);
    };

    mainLoop();

    const handleMouseDown = (event) => {
      object.startDragging(event);
    };

    const handleMouseUp = () => {
      object.stopDragging();
    };

    const handleMouseMove = (event) => {
      object.moveWithMouse(event);
    };

    const handleSpacebarDown = (event) => {
      if (event.code === 'Space') {
        object.size.w += 5;
        object.size.h += 5;
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('keydown', handleSpacebarDown);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('keydown', handleSpacebarDown);
    };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef}></canvas>
      <div>
        {/* YouTube IFrame Player */}
        <div id="youtube-player"></div>
      </div>
    </div>
  );
};

export default DraggableBall;
