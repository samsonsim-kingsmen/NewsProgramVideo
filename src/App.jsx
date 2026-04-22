import React, { useEffect, useMemo, useRef, useState } from "react";

export default function App() {
  const [screen, setScreen] = useState("landing");
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showGlitch, setShowGlitch] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  const touchStart = useRef(null);
  const mouseStart = useRef(null);
  const isMouseDragging = useRef(false);
  const glitchRef = useRef(null);
  const playerRef = useRef(null);

  useEffect(() => {
    const setAppHeight = () => {
      const h = window.visualViewport?.height || window.innerHeight;
      setViewportHeight(h);
    };

    setAppHeight();

    window.addEventListener("resize", setAppHeight);
    window.visualViewport?.addEventListener("resize", setAppHeight);

    return () => {
      window.removeEventListener("resize", setAppHeight);
      window.visualViewport?.removeEventListener("resize", setAppHeight);
    };
  }, []);

  const videos = useMemo(
    () => [
      {
        id: 0,
        title: "Tape 01",
        subtitle: "A quiet transmission.",
        thumbnail: "/thumbs/thumb-1.jpg",
        src: "/videos/video-1.mp4",
      },
      {
        id: 1,
        title: "Tape 02",
        subtitle: "Fragments of memory.",
        thumbnail: "/thumbs/thumb-2.jpg",
        src: "/videos/video-2.mp4",
      },
      {
        id: 2,
        title: "Tape 03",
        subtitle: "Signal drift.",
        thumbnail: "/thumbs/thumb-3.jpg",
        src: "/videos/video-3.mp4",
      },
      {
        id: 3,
        title: "Tape 04",
        subtitle: "Final loop.",
        thumbnail: "/thumbs/thumb-4.jpg",
        src: "/videos/video-4.mp4",
      },
    ],
    [],
  );

  const next = () => {
    setActiveIndex((i) => (i + 1) % videos.length);
  };

  const prev = () => {
    setActiveIndex((i) => (i - 1 + videos.length) % videos.length);
  };

  useEffect(() => {
    if (screen !== "player") return;
    const v = playerRef.current;
    if (!v) return;

    v.currentTime = 0;
    v.play().catch(() => {});
  }, [screen, activeIndex]);

  const triggerGlitch = (callback) => {
    setShowGlitch(true);

    window.setTimeout(() => {
      if (glitchRef.current) {
        glitchRef.current.pause();
        glitchRef.current.currentTime = 2;
        glitchRef.current.play().catch(() => {});
      }
    }, 0);

    const navTimeout = window.setTimeout(() => {
      callback();
    }, 120);

    const stopTimeout = window.setTimeout(() => {
      if (glitchRef.current) {
        glitchRef.current.pause();
        glitchRef.current.currentTime = 0;
      }
      setShowGlitch(false);
    }, 1000);

    return () => {
      clearTimeout(navTimeout);
      clearTimeout(stopTimeout);
    };
  };

  const handleSwipe = (delta) => {
    if (screen === "landing" && delta > 120) {
      triggerGlitch(() => setScreen("gallery"));
      return;
    }

    if (screen === "player") {
      if (delta > 120) {
        triggerGlitch(() => next());
      } else if (delta < -120) {
        prev();
      }
    }
  };

  const onTouchStart = (e) => {
    if (screen === "gallery") return;
    touchStart.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const onTouchMove = (e) => {
    if (screen === "gallery") return;
    if (touchStart.current == null) return;

    const delta = touchStart.current - e.touches[0].clientY;
    const limited = Math.max(Math.min(-delta * 0.35, 120), -120);
    setDragOffset(limited);
  };

  const onTouchEnd = (e) => {
    if (screen === "gallery") return;
    if (touchStart.current == null) return;

    const delta = touchStart.current - e.changedTouches[0].clientY;
    handleSwipe(delta);
    touchStart.current = null;
    setDragOffset(0);
    setIsDragging(false);
  };

  const onMouseDown = (e) => {
    if (screen === "gallery") return;
    mouseStart.current = e.clientY;
    isMouseDragging.current = true;
    setIsDragging(true);
  };

  const onMouseMove = (e) => {
    if (screen === "gallery") return;
    if (!isMouseDragging.current || mouseStart.current == null) return;

    const delta = mouseStart.current - e.clientY;
    const limited = Math.max(Math.min(-delta * 0.35, 120), -120);
    setDragOffset(limited);
  };

  const onMouseUp = (e) => {
    if (screen === "gallery") {
      mouseStart.current = null;
      isMouseDragging.current = false;
      setDragOffset(0);
      setIsDragging(false);
      return;
    }

    if (!isMouseDragging.current || mouseStart.current == null) return;

    const delta = mouseStart.current - e.clientY;
    handleSwipe(delta);
    mouseStart.current = null;
    isMouseDragging.current = false;
    setDragOffset(0);
    setIsDragging(false);
  };

  const appFrameStyle = {
    width: Math.min(window.innerWidth, viewportHeight * (4 / 3)),
    height: Math.min(viewportHeight, window.innerWidth * (3 / 4)),
    aspectRatio: "4 / 3",
    background: "#001133",
    backgroundImage:
      "repeating-linear-gradient(to bottom, rgba(255,255,255,0.12) 0px, rgba(255,255,255,0.12) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)",
    position: "relative",
    overflow: "hidden",
    color: "white",
    fontFamily: "sans-serif",
    transform: `translateY(${dragOffset}px)`,
    transition: isDragging ? "none" : "transform 0.22s ease",
  };

  const arrowWrapStyle = {
    position: "absolute",
    top: 28,
    left: "50%",
    transform: "translateX(-50%)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 20,
  };

  const arrowStyle = {
    fontSize: 34,
    lineHeight: 1,
    marginBottom: 8,
    animation: "arrowFloat 0.9s ease-in-out infinite",
    willChange: "transform",
  };

  return (
    <>
      <style>{`
        @keyframes arrowFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <div
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        style={{
          width: "100vw",
          height: `${viewportHeight}px`,
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          position: "fixed",
          inset: 0,
        }}
      >
        <div
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
          onMouseLeave={onMouseUp}
          style={appFrameStyle}
        >
          {showGlitch && (
            <video
              ref={glitchRef}
              src="/videos/glitch.mp4"
              muted
              playsInline
              autoPlay
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                zIndex: 50,
                pointerEvents: "none",
                opacity: 0.45,
                mixBlendMode: "screen",
              }}
            />
          )}

          {(screen === "gallery" || screen === "player") && (
            <div
              onClick={() => setScreen("landing")}
              style={{
                position: "absolute",
                top: 20,
                right: 20,
                zIndex: 30,
                padding: "8px 12px",
                border: "1px solid rgba(255,255,255,0.4)",
                background: "rgba(0,0,0,0.6)",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              BACK
            </div>
          )}

          {screen === "landing" && (
            <div style={{ position: "absolute", inset: 0 }}>
              <div style={{ ...arrowWrapStyle, zIndex: 2 }}>
                <div style={arrowStyle}>˄</div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  Swipe up to view more
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                }}
              >
                <h1>ARCHIVE</h1>
                <p>CRT monitor experience</p>
              </div>
            </div>
          )}

          {screen === "gallery" && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 125,
                  rowGap: 110,
                  width: "75%",
                }}
              >
                {videos.map((v, i) => (
                  <div
                    key={v.id}
                    onClick={() => {
                      setActiveIndex(i);
                      setScreen("player");
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <div
                      style={{
                        aspectRatio: "16/9",
                        overflow: "hidden",
                        marginBottom: 6,
                        border: "1px solid rgba(255,255,255,0.2)",
                      }}
                    >
                      <img
                        src={v.thumbnail}
                        alt={v.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>
                    <div style={{ fontSize: 14 }}>{v.title}</div>
                    <div style={{ fontSize: 11, opacity: 0.6 }}>
                      {v.subtitle}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === "player" && (
            <div style={{ position: "absolute", inset: 0 }}>
              <video
                key={videos[activeIndex].src}
                ref={playerRef}
                src={videos[activeIndex].src}
                autoPlay
                playsInline
                controls={false}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />

              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "22%",
                  background:
                    "linear-gradient(to bottom, rgba(0,0,0,0.85), rgba(0,0,0,0))",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />

              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: "28%",
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0))",
                  pointerEvents: "none",
                  zIndex: 5,
                }}
              />

              <div style={arrowWrapStyle}>
                <div style={arrowStyle}>˄</div>
                <div
                  style={{
                    fontSize: 12,
                    letterSpacing: 0.5,
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  Swipe up to see next
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 20,
                  left: 20,
                  zIndex: 20,
                }}
              >
                {videos.map((v, i) => (
                  <div
                    key={v.id}
                    style={{
                      color: i === activeIndex ? "white" : "gray",
                      fontSize: i === activeIndex ? 20 : 14,
                    }}
                  >
                    {v.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}