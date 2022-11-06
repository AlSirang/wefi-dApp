import { lazy, useLayoutEffect } from "react";
import LoadWithSuspense from "../../components/loadWithSuspense";
import { ButtonUserContext } from "../../context";
const DashboardComponent = lazy(() =>
  import("./dashboard" /* webpackChunkName: "presale-page" */)
);

const DashboardPage = () => {
  const { updateButton } = ButtonUserContext();

  useLayoutEffect(() => {
    updateButton({
      name: "Buy Now",
      path: "/",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <LoadWithSuspense>
      <DashboardComponent />
    </LoadWithSuspense>
  );
};

export default DashboardPage;
