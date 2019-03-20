/**
 * @class AsyncArray
 * @template T
 * @extends {PromiseLike}
 * @description {@link AsyncArray} wraps an array and provides functional asynchronous list comprehension methods.
 * @version 0.1.0
 */
class AsyncArray {
  constructor(...rest) {
    this._operation = Promise.resolve(new Array(...rest));
  }

  /**
   * @template A,B
   * @param { Promise<A> } arrayLikePromise
   * @param { (value:A, index:number, array:ReadonlyArray<A[]>)=>Promise<B> } mapFn
   * @param { any } [thisArg]
   */
  static asyncFrom(arrayLikePromise, mapFn, thisArg) {
    const newArray = new this();
    const unpackArray = async () => arrayLikePromise;
    newArray._operation = unpackArray();

    if (mapFn) {
      newArray.asyncMap(mapFn, thisArg);
    }

    return newArray;
  }

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
    return this._operation.then((array) => {
      const asyncReducer = (promise, item, currentIndex, source) => promise.then(
        result => reducer(result, item, currentIndex, source)
      );

      if (initialValue === undefined) {
        if (array.length === 0) {
          this._operation.then(() => {
            throw new TypeError();
          });
        }
        if (array.length === 1) {
          this._operation.then(() => this[0]);
        }
        const offsetArray = array.slice(1);
        return offsetArray.reduce(asyncReducer, Promise.resolve(array[0]));
      }

      if (array.length === 0) {
        return Promise.resolve(initialValue);
      }

      return array.reduce(asyncReducer, Promise.resolve(initialValue));
    });
  }

  asyncForEach(callbackfn, thisArg) {
    if (this.length < 1) {
      Promise.resolve();
    }

    const returnValue = this._operation;

    this.forEach(((value, index, array) => {
      returnValue.then(() => callbackfn.call(thisArg, value, index, array));
    }));

    return this;
  }

  /**
   * @template O
   * @param { (value:T, index:number, array:ReadonlyArray<T[]>) => (Promise<O>|O) } callbackfn
   * @param { any } [thisArg=undefined]
   * @returns { this }
   */
  asyncMap(callbackfn, thisArg) {
    const boundCallback = callbackfn.bind(thisArg);

    this._operation = this._operation.then((items) => {
      if (items.length < 1) {
        return [];
      }

      return AsyncArray.asyncFrom(items).asyncReduce(
        async (newArray, value, index, array) => {
          const output = await boundCallback(value, index, array);
          // eslint-disable-next-line
          newArray[index] = output;
          return newArray;
        },
        []
      );
    });

    return this;
  }

  then(...rest) {
    return this._operation.then(...rest);
  }
}

module.exports = AsyncArray;
