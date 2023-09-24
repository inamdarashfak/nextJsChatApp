import React from "react";
import Loader from "react-loader-spinner";

function LoadingState({ width, height, color }) {
  return (
    <div className="item-center">
      <Loader
        type="TailSpin"
        color={color}
        height={height}
        width={width}
        // timeout={3000} //3 secs
      />
    </div>
  );
}

export default LoadingState;
