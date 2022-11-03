import { Suspense } from "react";
import Layout from "./layout";
import LineOfDots from "./line-of-dots";

const LoadWithSuspense = ({ children }) => {
  const FallbackSuspense = () => {
    return (
      <>
        <div className="overlay-image">
          <div className="overlay-color"></div>
        </div>
        <div className="d-flex overlay-container">
          <LineOfDots />
        </div>
      </>
    );
  };
  return (
    <Layout>
      <Suspense fallback={<FallbackSuspense />}>{children}</Suspense>
    </Layout>
  );
};

export default LoadWithSuspense;
