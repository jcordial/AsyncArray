/**
 * @template T,A
 * @param { (accumulator:T, currentValue, currentIndex:number, source:[]) => A } reducer
 * @return { (Promise<A>, T) => Promise<A> }
 */
function promisedReducer(reducer) {
  /**
   * @description A static function for reducing two values into one asynchronously.
   * @template T
   * @param {Promise<A>} promise The promise to chain the next reduction to.
   * @param {T} item
   * @return {Promise<A>}
   */
  return (promise, item, currentIndex, source) => promise.then(
    result => reducer(result, item, currentIndex, source)
  );
}

/**
 * @class AsyncArray
 * @template T
 * @extends Array.<T>
 * @description {@link AsyncArray} wraps an array and provides functional asynchronous list comprehension methods.
 * @version 0.0.2
 */
class AsyncArray extends Array {
  /**
   * Reduce an array functionally. A async
   * @template O
   * @param reducer
   * @param { T } initialValue
   * @return { Promise<O> }
   * @throws { TypeError }
   * @see Array.reduce
   * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#Description
   */
  asyncReduce(reducer, initialValue) {
    const asyncReducer = promisedReducer(reducer);

    if (initialValue === undefined) {
      if (this.length === 0) {
        return Promise.reject(new TypeError());
      }
      if (this.length === 1) {
        return Promise.resolve(this[0]);
      }
      const offsetArray = this.slice(1);
      return offsetArray.reduce(asyncReducer, Promise.resolve(this[0]));
    }

    if (this.length === 0) {
      return Promise.resolve(initialValue);
    }

    return this.reduce(asyncReducer, Promise.resolve(initialValue));
  }

  asyncForEach(callbackfn, thisArg) {
    if (this.length < 1) {
      Promise.resolve();
    }

    const returnValue = Promise.resolve();

    this.forEach(((value, index, array) => {
      returnValue.then(() => callbackfn.call(thisArg, value, index, array));
    }));

    return returnValue;
  }
}

module.exports = AsyncArray;
