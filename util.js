/**
    Dao  Drip © Peter Rodrick.
    Displays the same random chapter of the Daodejing
    from characteristically distinct translations.
**/

document.body.addEventListener("mousemove", (evt) => {
  const mouseX = evt.clientX;
  const mouseY = evt.clientY;

  gsap.set(".cursor", {
    x: mouseX,
    y: mouseY,
  });
});
