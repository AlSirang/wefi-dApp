import { lazy, useLayoutEffect } from "react";
import LoadWithSuspense from "../../components/loadWithSuspense";
import { ButtonUserContext } from "../../context";
const PresaleComponent = lazy(() =>
  import("./presale" /* webpackChunkName: "presale-page" */)
);

const PresalePage = () => {
  const { updateButton } = ButtonUserContext();

  useLayoutEffect(() => {
    updateButton({
      name: "Dashboard",
      path: "/dashboard",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <LoadWithSuspense>
      <PresaleComponent />
    </LoadWithSuspense>
  );
};

export default PresalePage;
