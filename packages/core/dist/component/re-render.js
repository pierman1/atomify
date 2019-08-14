import { addRemoveEventListeners } from '../decorators';
import { updateComponent, safeCall } from '../component';
import { setInitialPropertyValues } from './set-initial-property-values';
export const reRender = async (target, options, instance) => {
    safeCall(target, instance, 'componentWillRender');
    await setInitialPropertyValues(target, instance);
    await addRemoveEventListeners(target, 'removeEventListener');
    await updateComponent(target, options, true);
    await addRemoveEventListeners(target);
    safeCall(target, instance, 'componentDidRender');
};
//# sourceMappingURL=re-render.js.map