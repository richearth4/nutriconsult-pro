import appState from '../../assets/js/modules/state.js';

describe('AppState Management', () => {
    beforeEach(() => {
        appState.reset();
    });

    test('should initialize with default state', () => {
        expect(appState.getUser()).toBeNull();
        expect(appState.getClients()).toEqual([]);
        expect(appState.get('loading')).toBe(false);
    });

    test('should update state and notify listeners', () => {
        const listener = jest.fn();
        appState.subscribe('user', listener);

        const user = { id: 1, name: 'Test User' };
        appState.setUser(user);

        expect(appState.getUser()).toEqual(user);
        expect(listener).toHaveBeenCalledWith(user);
    });

    test('should handle multiple listeners', () => {
        const listenerA = jest.fn();
        const listenerB = jest.fn();

        appState.subscribe('loading', listenerA);
        appState.subscribe('loading', listenerB);

        appState.setLoading(true);

        expect(listenerA).toHaveBeenCalledWith(true);
        expect(listenerB).toHaveBeenCalledWith(true);
    });

    test('should unsubscribe correctly', () => {
        const listener = jest.fn();
        const unsubscribe = appState.subscribe('error', listener);

        appState.setError('Something went wrong');
        expect(listener).toHaveBeenCalledTimes(1);

        unsubscribe();
        appState.setError('Another error');
        expect(listener).toHaveBeenCalledTimes(1);
    });
});
