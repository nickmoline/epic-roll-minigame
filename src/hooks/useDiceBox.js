import { useRef, useState, useCallback } from 'react';

const ALLY_COLOR = '#15803d';
const ENEMY_COLOR = '#dc2626';

export function useDiceBox() {
  const boxRef = useRef(null);
  const initPromise = useRef(null);
  const [ready, setReady] = useState(false);

  const init = useCallback(async () => {
    if (boxRef.current) return boxRef.current;
    if (initPromise.current) return initPromise.current;

    initPromise.current = (async () => {
      try {
        const { default: DiceBox } = await import('@3d-dice/dice-box');
        const box = new DiceBox({
          assetPath: '/assets/',
          container: '#dice-tray',
          scale: 12,
          gravity: 3,
          friction: 0.8,
          restitution: 0,
          angularDamping: 0.6,
          linearDamping: 0.6,
          spinForce: 3,
          throwForce: 3,
          startingHeight: 5,
          settleTimeout: 3000,
          enableShadows: true,
          offscreen: false,
        });
        await box.init();
        boxRef.current = box;
        setReady(true);
        return box;
      } catch (err) {
        console.error('DiceBox init failed:', err);
        initPromise.current = null;
        return null;
      }
    })();

    return initPromise.current;
  }, []);

  const roll = useCallback(async (goodDie, badDie) => {
    let box = boxRef.current;
    if (!box) {
      box = await init();
      if (!box) return null;
    }

    try {
      const results = await box.roll([
        { qty: 1, sides: goodDie, themeColor: ALLY_COLOR },
        { qty: 1, sides: badDie, themeColor: ENEMY_COLOR },
      ]);

      if (!results || results.length < 2) {
        console.warn('Expected 2 dice results, got:', results);
        return null;
      }

      const goodResult = results.find((r) => r.groupId === 0);
      const badResult = results.find((r) => r.groupId === 1);

      return {
        rollGood: goodResult?.value ?? results[0].value,
        rollBad: badResult?.value ?? results[1].value,
      };
    } catch (err) {
      console.error('Dice roll failed:', err);
      return null;
    }
  }, [init]);

  return { init, roll, ready };
}
