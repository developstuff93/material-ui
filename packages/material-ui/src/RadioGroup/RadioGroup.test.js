import * as React from 'react';
import { assert, expect } from 'chai';
import { spy } from 'sinon';
import * as PropTypes from 'prop-types';
import { createMount, findOutermostIntrinsic } from '@material-ui/core/test-utils';
import describeConformance from '../test-utils/describeConformance';
import { createClientRender } from 'test/utils/createClientRender';
import FormGroup from '../FormGroup';
import Radio from '../Radio';
import RadioGroup from './RadioGroup';
import consoleErrorMock from 'test/utils/consoleErrorMock';
import useRadioGroup from './useRadioGroup';

describe('<RadioGroup />', () => {
  let mount;
  const render = createClientRender({ strict: true });

  before(() => {
    // StrictModeViolation: test uses #simulate
    mount = createMount({ strict: false });
  });

  after(() => {
    mount.cleanUp();
  });

  function findRadio(wrapper, value) {
    return wrapper.find(`input[value="${value}"]`).first();
  }

  describeConformance(<RadioGroup value="" />, () => ({
    classes: {},
    inheritComponent: FormGroup,
    mount,
    refInstanceof: window.HTMLDivElement,
    skip: ['componentProp'],
  }));

  it('the root component has the radiogroup role', () => {
    const wrapper = mount(<RadioGroup value="" />);
    assert.strictEqual(findOutermostIntrinsic(wrapper).props().role, 'radiogroup');
  });

  it('should fire the onBlur callback', () => {
    const handleBlur = spy();
    const wrapper = mount(<RadioGroup value="" onBlur={handleBlur} />);

    const eventMock = 'something-to-match';
    wrapper.simulate('blur', { eventMock });
    assert.strictEqual(handleBlur.callCount, 1);
    assert.strictEqual(handleBlur.calledWithMatch({ eventMock }), true);
  });

  it('should fire the onKeyDown callback', () => {
    const handleKeyDown = spy();
    const wrapper = mount(<RadioGroup value="" onKeyDown={handleKeyDown} />);

    const eventMock = 'something-to-match';
    wrapper.simulate('keyDown', { eventMock });
    assert.strictEqual(handleKeyDown.callCount, 1);
    assert.strictEqual(handleKeyDown.calledWithMatch({ eventMock }), true);
  });

  it('should support uncontrolled mode', () => {
    const wrapper = mount(
      <RadioGroup name="group">
        <Radio value="one" />
      </RadioGroup>,
    );

    findRadio(wrapper, 'one').simulate('change');
    assert.strictEqual(findRadio(wrapper, 'one').props().checked, true);
  });

  it('should support default value in uncontrolled mode', () => {
    const wrapper = mount(
      <RadioGroup name="group" defaultValue="zero">
        <Radio value="zero" />
        <Radio value="one" />
      </RadioGroup>,
    );

    assert.strictEqual(findRadio(wrapper, 'zero').props().checked, true);
    findRadio(wrapper, 'one').simulate('change');
    assert.strictEqual(findRadio(wrapper, 'one').props().checked, true);
  });

  it('should have a default name', () => {
    const wrapper = mount(
      <RadioGroup>
        <Radio value="zero" />
        <Radio value="one" />
      </RadioGroup>,
    );

    assert.match(findRadio(wrapper, 'zero').props().name, /^mui-radiogroup-[0-9]+/);
    assert.match(findRadio(wrapper, 'one').props().name, /^mui-radiogroup-[0-9]+/);
  });

  describe('imperative focus()', () => {
    it('should focus the first non-disabled radio', () => {
      const actionsRef = React.createRef();
      const oneRadioOnFocus = spy();

      mount(
        <RadioGroup actions={actionsRef} value="">
          <Radio value="zero" disabled />
          <Radio value="one" onFocus={oneRadioOnFocus} />
          <Radio value="two" />
        </RadioGroup>,
      );

      actionsRef.current.focus();
      assert.strictEqual(oneRadioOnFocus.callCount, 1);
    });

    it('should not focus any radios if all are disabled', () => {
      const actionsRef = React.createRef();
      const zeroRadioOnFocus = spy();
      const oneRadioOnFocus = spy();
      const twoRadioOnFocus = spy();

      mount(
        <RadioGroup actions={actionsRef} value="">
          <Radio value="zero" disabled onFocus={zeroRadioOnFocus} />
          <Radio value="one" disabled onFocus={oneRadioOnFocus} />
          <Radio value="two" disabled onFocus={twoRadioOnFocus} />
        </RadioGroup>,
      );

      actionsRef.current.focus();

      assert.strictEqual(zeroRadioOnFocus.callCount, 0);
      assert.strictEqual(oneRadioOnFocus.callCount, 0);
      assert.strictEqual(twoRadioOnFocus.callCount, 0);
    });

    it('should focus the selected radio', () => {
      const actionsRef = React.createRef();
      const twoRadioOnFocus = spy();

      mount(
        <RadioGroup actions={actionsRef} value="two">
          <Radio value="zero" disabled />
          <Radio value="one" />
          <Radio value="two" onFocus={twoRadioOnFocus} />
          <Radio value="three" />
        </RadioGroup>,
      );

      actionsRef.current.focus();
      assert.strictEqual(twoRadioOnFocus.callCount, 1);
    });

    it('should focus the non-disabled radio rather than the disabled selected radio', () => {
      const actionsRef = React.createRef();
      const threeRadioOnFocus = spy();

      mount(
        <RadioGroup actions={actionsRef} value="two">
          <Radio value="zero" disabled />
          <Radio value="one" disabled />
          <Radio value="two" disabled />
          <Radio value="three" onFocus={threeRadioOnFocus} />
        </RadioGroup>,
      );

      actionsRef.current.focus();
      assert.strictEqual(threeRadioOnFocus.callCount, 1);
    });

    it('should be able to focus with no radios', () => {
      const actionsRef = React.createRef();
      mount(<RadioGroup actions={actionsRef} value="" />);

      actionsRef.current.focus();
    });
  });

  it('should accept invalid child', () => {
    mount(
      <RadioGroup value="">
        <Radio />
        {null}
      </RadioGroup>,
    );
  });

  describe('prop: onChange', () => {
    it('should fire onChange', () => {
      const handleChange = spy();
      const wrapper = mount(
        <RadioGroup value="" onChange={handleChange}>
          <Radio value="woofRadioGroup" />
          <Radio />
        </RadioGroup>,
      );

      const eventMock = 'something-to-match';
      findRadio(wrapper, 'woofRadioGroup').simulate('change', { eventMock });
      assert.strictEqual(handleChange.callCount, 1);
      assert.strictEqual(handleChange.calledWithMatch({ eventMock }), true);
    });

    it('should chain the onChange property', () => {
      const handleChange1 = spy();
      const handleChange2 = spy();
      const wrapper = mount(
        <RadioGroup value="" onChange={handleChange1}>
          <Radio value="woofRadioGroup" onChange={handleChange2} />
          <Radio />
        </RadioGroup>,
      );

      findRadio(wrapper, 'woofRadioGroup').simulate('change');
      assert.strictEqual(handleChange1.callCount, 1);
      assert.strictEqual(handleChange2.callCount, 1);
    });

    describe('with non-string values', () => {
      before(() => {
        // swallow prop-types warnings
        consoleErrorMock.spy();
      });

      after(() => {
        consoleErrorMock.reset();
      });

      it('passes the value of the selected Radio as a string', () => {
        function selectNth(wrapper, n) {
          return wrapper.find('input[type="radio"]').at(n).simulate('change');
        }
        function isNthChecked(wrapper, n) {
          return wrapper.find('input[type="radio"]').at(n).is('[checked=true]');
        }
        function Test(props) {
          const { values, ...other } = props;
          return (
            <RadioGroup {...other}>
              {values.map((value) => {
                return <Radio key={value.id} value={value} />;
              })}
            </RadioGroup>
          );
        }
        Test.propTypes = {
          values: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.number.isRequired })),
        };

        const values = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }];
        const handleChange = spy();

        const wrapper = mount(<Test onChange={handleChange} value={values[1]} values={values} />);
        // on the initial mount it works because we compare to the `value` prop
        assert.strictEqual(isNthChecked(wrapper, 0), false);
        assert.strictEqual(isNthChecked(wrapper, 1), true);

        selectNth(wrapper, 0);
        // on updates, however, we compare against event.target.value
        // object information is lost on stringification.
        assert.strictEqual(isNthChecked(wrapper, 0), false);
        assert.strictEqual(isNthChecked(wrapper, 1), true);
        assert.strictEqual(handleChange.firstCall.args[1], '[object Object]');
      });
    });
  });

  describe('useRadioGroup', () => {
    const RadioGroupController = React.forwardRef((_, ref) => {
      const radioGroup = useRadioGroup();
      React.useImperativeHandle(ref, () => radioGroup, [radioGroup]);
      return null;
    });

    const RadioGroupControlled = React.forwardRef(function RadioGroupControlled(props, ref) {
      return (
        <RadioGroup {...props}>
          <RadioGroupController ref={ref} />
        </RadioGroup>
      );
    });

    describe('from props', () => {
      it('should have the name prop from the instance', () => {
        const radioGroupRef = React.createRef();
        const { setProps } = render(<RadioGroupControlled name="group" ref={radioGroupRef} />);

        expect(radioGroupRef.current).to.have.property('name', 'group');

        setProps({ name: 'anotherGroup' });
        expect(radioGroupRef.current).to.have.property('name', 'anotherGroup');
      });

      it('should have the value prop from the instance', () => {
        const radioGroupRef = React.createRef();
        const { setProps } = render(<RadioGroupControlled ref={radioGroupRef} value="" />);

        expect(radioGroupRef.current).to.have.property('value', '');

        setProps({ value: 'one' });
        expect(radioGroupRef.current).to.have.property('value', 'one');
      });

      it('should have a default name from the instance', () => {
        const radioGroupRef = React.createRef();
        const { setProps } = render(<RadioGroupControlled ref={radioGroupRef} />);

        expect(radioGroupRef.current.name).to.match(/^mui-radiogroup-[0-9]+/);

        setProps({ name: 'anotherGroup' });
        expect(radioGroupRef.current).to.have.property('name', 'anotherGroup');
      });
    });

    describe('callbacks', () => {
      describe('onChange', () => {
        it('should set the value state', () => {
          const radioGroupRef = React.createRef();
          render(<RadioGroupControlled ref={radioGroupRef} defaultValue="zero" />);

          expect(radioGroupRef.current).to.have.property('value', 'zero');

          radioGroupRef.current.onChange({ target: { value: 'one' } });
          expect(radioGroupRef.current).to.have.property('value', 'one');

          radioGroupRef.current.onChange({ target: { value: 'two' } });
          expect(radioGroupRef.current).to.have.property('value', 'two');
        });
      });
    });
  });

  describe('warnings', () => {
    beforeEach(() => {
      consoleErrorMock.spy();
    });

    afterEach(() => {
      consoleErrorMock.reset();
    });

    it('should warn when switching from controlled to uncontrolled', () => {
      const wrapper = mount(
        <RadioGroup value="foo">
          <Radio value="foo" />
        </RadioGroup>,
      );

      wrapper.setProps({ value: undefined });
      expect(consoleErrorMock.messages()[0]).to.include(
        'Material-UI: a component is changing the controlled value state of RadioGroup to be uncontrolled.',
      );
    });

    it('should warn when switching between uncontrolled to controlled', () => {
      const wrapper = mount(
        <RadioGroup>
          <Radio value="foo" />
        </RadioGroup>,
      );

      wrapper.setProps({ value: 'foo' });
      expect(consoleErrorMock.messages()[0]).to.include(
        'Material-UI: a component is changing the uncontrolled value state of RadioGroup to be controlled.',
      );
    });
  });
});
