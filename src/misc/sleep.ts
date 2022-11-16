const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms)).then(() => null);
};

export default sleep;
