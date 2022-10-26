import "../styles/frostedGlassOverlay.css";

const FrostedGlassOverlay = ({ children }) => {
  return (
    <div className="overlay-effect-background">
      <div className="overlay-effect-container">{children}</div>
    </div>
  );
};

export default FrostedGlassOverlay;
