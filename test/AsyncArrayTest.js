const AsyncArray = require('../../../api/helpers/promises/AsyncArray');
const sinon = require('sinon');

describe('AsyncArray', () => {
  const sandbox = sinon.sandbox.create();
  afterEach(() => {
    sandbox.restore();
  });

  describe('asyncReduce', () => {
    it('should resolve to the same value reduce would', async () => {
      const sum = (total, current) => current + total;

      const testArray = [1, 2, 3, 4, 5];
      const asyncArray = new AsyncArray(...testArray);

      const arrayReduction = testArray.reduce(sum, 0);

      arrayReduction.should.equal(15);

      const reduce = asyncArray.asyncReduce(sum, 0);
      reduce.should.be.a.Promise();
      await reduce.should.be.resolvedWith(arrayReduction);
    });

    context('when the array is empty', () => {
      it('should resolve the argument passed to initialValue', async () => {
        const asyncArray = new AsyncArray();
        const reducer = sandbox.spy();
        const initialValue = Symbol('Unique Value');
        await asyncArray.asyncReduce(reducer, initialValue).should.be.resolvedWith(initialValue);
      });

      it('should not call the reducer function', async () => {
        const asyncArray = new AsyncArray();
        const reducer = sandbox.spy();
        await asyncArray.asyncReduce(reducer, {}).should.be.resolved();
        sandbox.assert.notCalled(reducer);
      });

      it('should throw a type error if no initialValue is passed', async () => {
        const asyncArray = new AsyncArray();
        const reducer = sandbox.spy();
        await asyncArray.asyncReduce(reducer).should.be.rejectedWith(TypeError);
        sandbox.assert.notCalled(reducer);
      });
    });
  });

  describe('asyncForEach', () => {
    it('should not call the callbackFn if the promise is not awaited', () => {
      const spy = sandbox.spy();
      const testArray = [1, 2, 3, 4, 5];
      const asyncList = new AsyncArray(...testArray);
      asyncList.asyncForEach(spy);
      sandbox.assert.notCalled(spy);
    });

    it('should pass each item to the callbackFn when resolving', async () => {
      const spy = sandbox.spy();

      const testArray = [1, 2, 3, 4, 5];
      const asyncList = new AsyncArray(...testArray);


      const promise = asyncList.asyncForEach(spy);
      promise.should.be.a.Promise();


      await promise.should.resolvedWith(undefined);


      sandbox.assert.callCount(spy, testArray.length);
      sandbox.assert.calledWith(spy.getCall(0), 1);
      sandbox.assert.calledWith(spy.getCall(1), 2);
      sandbox.assert.calledWith(spy.getCall(2), 3);
      sandbox.assert.calledWith(spy.getCall(3), 4);
      sandbox.assert.calledWith(spy.getCall(4), 5);
    });

    context('when array has no items', () => {
      it('should not call callbackFn either before or after resolving the promise', async () => {
        const asyncList = new AsyncArray();
        const spy = sandbox.spy();

        asyncList.should.have.a.lengthOf(0);

        sandbox.assert.notCalled(spy);
        await asyncList.asyncForEach(spy).should.resolvedWith(undefined);
        sandbox.assert.notCalled(spy);
      });
    });

    context('when a thisArg is set', () => {
      it('should call callbackFn with this = thisArg', async () => {
        const asyncList = new AsyncArray(1, 2, 3);
        const spy = sandbox.spy();
        const thisArg = sandbox.spy();

        await asyncList.asyncForEach(spy, thisArg);

        sinon.assert.calledThrice(spy);
        sinon.assert.alwaysCalledOn(spy, thisArg);
      });
    });
  });
});
