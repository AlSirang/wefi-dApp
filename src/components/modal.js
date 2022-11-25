import ReactModal from "react-modal";
export default function Modal(props) {
  return (
    <ReactModal
      {...props}
      ariaHideApp={false}
      style={{
        overlay: {
          background: "transparent",
        },

        content: {
          background: "transparent",
          border: "none",
        },
      }}
    />
  );
}
