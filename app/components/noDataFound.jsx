import React from "react";

function NoDataFound({ title, subTitle, icon, marginTop }) {
  return (
    <div
      className="no-data-found"
      style={{ marginTop: marginTop ? marginTop : 90 }}
    >
      <div></div>
      <div style={{ marginTop: 15 }}>{title}</div>
    </div>
  );
}

export default NoDataFound;
