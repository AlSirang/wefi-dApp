import Header from "./header";
import Sidebar from "./sidebar";

const Layout = ({ children }) => {
  return (
    <div className="row">
      <Sidebar />

      <div className="col-10 col-md-9 col-sm-12 overlay-container right-section">
        <Header />
        {children}
      </div>
    </div>
  );
};

export default Layout;
