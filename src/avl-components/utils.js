import React from "react"

const getRect = ref => {
  const node = ref ? ref.current : ref;
  if (!node) return { width: 0, height: 0 };
  return node.getBoundingClientRect();
}

const InitialState = {
  width: 0,
  height: 0
}
const Reducer = (state, action) => {
  const { type, ...payload } = action;
  switch (type) {
    case "set-size": {
      const { width, height } = payload;
      if (width !== state.width || height !== state.height) {
        return {
          width, height
        }
      }
      return state;
    }
    default:
      return state;
  }
}

export const useSetSize = ref => {
  const [size, dispatch] = React.useReducer(Reducer, InitialState)

  React.useEffect(() => {
    const onResize = e => {
      const { width, height } = getRect(ref);
      dispatch({
        type: "set-size",
        width, height
      });
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
    }
  }, [ref]);

  React.useLayoutEffect(() => {
    const { width, height } = getRect(ref);
    dispatch({
      type: "set-size",
      width, height
    });
  });

  return size;
}

export const useAsyncSafe = func => {
  const mounted = React.useRef(false);
  React.useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);
  return React.useCallback((...args) => {
    mounted.current && func(...args);
  }, [func]);
}
