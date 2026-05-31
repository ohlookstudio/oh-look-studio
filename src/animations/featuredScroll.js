import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function mountFeaturedScroll() {
  const section = document.getElementById("homeFeatured");
  const track = document.getElementById("featuredTrack");
  if (!section || !track) return () => {};

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReduced || window.innerWidth < 768) return () => {};

  // Distance = track width minus one viewport (track is 150vw → 50vw of scroll)
  const getDistance = () => Math.max(0, track.offsetWidth - window.innerWidth);

  const tween = gsap.to(track, {
    x: () => -getDistance(),
    ease: "none",
    scrollTrigger: {
      trigger: section,
      start: "top top",
      end: () => "+=" + getDistance(),
      pin: true,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  });

  return () => {
    tween.scrollTrigger?.kill();
    tween.kill();
    gsap.set(track, { clearProps: "x,transform" });
  };
}
