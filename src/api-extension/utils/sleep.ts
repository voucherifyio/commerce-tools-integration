const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms)).then((e) => null);
};

export default sleep;
