import React from "react"

const getRect = ref => {
  const node = ref ? ref.current : ref;
  if (!node) return { width: 0, height: 0 };
  return node.getBoundingClientRect();
}

export const useSetSize = ref => {
  const [size, _setSize] = React.useState({ width: 0, height: 0 }),
    setSize = React.useCallback(size => {
      _setSize(size);
    }, [_setSize]);

  React.useLayoutEffect(() => {
    const { width, height } = getRect(ref);

    if (width !== size.width || height !== size.height) {
      setSize({ width, height });
    }
  });

  return size;
}
