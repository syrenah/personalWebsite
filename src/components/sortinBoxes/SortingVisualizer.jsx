import React, { useState } from 'react';
import Boxes from './Boxes';
import TextField from '@mui/material/TextField';
import { Button, Stack } from '@mui/material';
import { BRAND_BLUE, BRAND_BLUE_DARK,TERMINAL_GREEN,DARKER_GREEN,MOCK_OUTPUT} from '../../config/contants';


// ========================
// Parent Sort class
// ========================

class Sort {
  constructor(setState) {
    this.setState = setState;
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async sort(array) {
    throw new Error('sort() must be implemented');
  }
}

// ========================
// Bubble Sort
// ========================

class BubbleSort extends Sort {
  async sort(array) {
    const result = [...array];

    for (let i = 0; i < result.length; i++) {
      for (let j = 0; j < result.length - i - 1; j++) {
        if (result[j] > result[j + 1]) {
          [result[j], result[j + 1]] = [
            result[j + 1],
            result[j],
          ];

          this.setState([...result]);
          await this.sleep(100);
        }
      }
    }

    this.setState([...result]);
    return result;
  }
}

// ========================
// Insertion Sort
// ========================

class InsertionSort extends Sort {
  async sort(array) {
    const result = [...array];

    for (let i = 1; i < result.length; i++) {
      const current = result[i];
      let j = i - 1;

      while (j >= 0 && result[j] > current) {
        result[j + 1] = result[j];
        j--;

        this.setState([...result]);
        await this.sleep(100);
      }

      result[j + 1] = current;

      this.setState([...result]);
      await this.sleep(100);
    }

    this.setState([...result]);
    return result;
  }
}

// ========================
// Merge Sort
// ========================

class MergeSort extends Sort {
  async sort(array) {
    if (array.length <= 1) {
      return [...array];
    }

    const middle = Math.floor(array.length / 2);

    const left = await this.sort(
      array.slice(0, middle)
    );

    const right = await this.sort(
      array.slice(middle)
    );

    const result = await this.merge(left, right);

    this.setState([...result]);

    return result;
  }

  async merge(left, right) {
    const result = [];

    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (left[i] <= right[j]) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }

      this.setState([...result, ...left.slice(i), ...right.slice(j)]);

      await this.sleep(100);
    }

    while (i < left.length) {
      result.push(left[i]);
      i++;

      this.setState([
        ...result,
        ...left.slice(i),
        ...right.slice(j),
      ]);

      await this.sleep(100);
    }

    while (j < right.length) {
      result.push(right[j]);
      j++;

      this.setState([
        ...result,
        ...left.slice(i),
        ...right.slice(j),
      ]);

      await this.sleep(100);
    }

    return result;
  }
}

// ========================
// React Component
// ========================

function SortingVisualizer() {
  const MAX_NUMBERS = 30;

  const [input, setInput] = useState(
    '33, 6, 99, 1, 444, 6, 91, 0, 9, 2, 5, 79, 7, 5, 2, 88, 1, 3, 0'
  );

  // ========================
  // Parse numbers
  // ========================

  const parseNumbers = (value) => {
    if (typeof value !== 'string') {
      return [];
    }

    const parts = value.split(',');

    const numbers = [];

    for (const part of parts) {
      const trimmed = part.trim();

      // Ignore empty values
      if (trimmed === '') {
        continue;
      }

      // Only allow integers or decimals
      if (!/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(trimmed)) {
        continue;
      }

      const number = Number(trimmed);

      if (!Number.isFinite(number)) {
        continue;
      }

      numbers.push(number);
    }

    return numbers;
  };

  // ========================
  // Derived input state
  // ========================

  const numbers = parseNumbers(input);

  const commaParts = input
    .split(',')
    .map(value => value.trim())
    .filter(value => value !== '');

  const tooManyNumbers = commaParts.length > MAX_NUMBERS;

  const hasInvalidNumbers = commaParts.some(
    value =>
      !/^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(value)
  );

  const hasError =
    tooManyNumbers || hasInvalidNumbers;

  // ========================
  // Sort states
  // ========================

  const [bubble, setBubble] = useState(numbers);
  const [insertion, setInsertion] = useState(numbers);
  const [merge, setMerge] = useState(numbers);

  const [bubbleSorted, setBubbleSorted] =
    useState(false);

  const [insertionSorted, setInsertionSorted] =
    useState(false);

  const [mergeSorted, setMergeSorted] =
    useState(false);

  // ========================
  // Change input
  // ========================

  const handleInputChange = (e) => {
    const value = e.target.value;

    setInput(value);

    const parsedNumbers = parseNumbers(value);

    setBubble(parsedNumbers);
    setInsertion(parsedNumbers);
    setMerge(parsedNumbers);

    setBubbleSorted(false);
    setInsertionSorted(false);
    setMergeSorted(false);
  };

  // ========================
  // Start sorting
  // ========================

  const startSorting = () => {
    if (hasError || numbers.length === 0) {
      return;
    }

    // Reset everything
    setBubble(numbers);
    setInsertion(numbers);
    setMerge(numbers);

    setBubbleSorted(false);
    setInsertionSorted(false);
    setMergeSorted(false);

    const bubbleSort = new BubbleSort(setBubble);
    const insertionSort = new InsertionSort(setInsertion);
    const mergeSort = new MergeSort(setMerge);

    bubbleSort.sort(numbers).then(() => {
      setBubbleSorted(true);
    });

    insertionSort.sort(numbers).then(() => {
      setInsertionSorted(true);
    });

    mergeSort.sort(numbers).then(() => {
      setMergeSorted(true);
    });
  };

  // ========================
  // Helper text
  // ========================

  const getHelperText = () => {
    if (tooManyNumbers) {
      return `Too many numbers! Maximum is ${MAX_NUMBERS}. You entered ${commaParts.length}.`;
    }

    if (hasInvalidNumbers) {
      return 'Invalid input. Enter numbers separated by commas.';
    }

    return `${numbers.length}/${MAX_NUMBERS} numbers • Separate each number with a comma`;
  };

  // ========================
  // Render
  // ========================

  return (
<div>

    <div
    
    
    style={{
           padding:'20px',
          color: MOCK_OUTPUT,
        }}>

      
      <h2>Numbers</h2>

      <TextField
        value={input}
        onChange={handleInputChange}
        multiline
        minRows={3}
        maxRows={5}
        fullWidth
        error={hasError}
        label="Enter numbers"
        placeholder="10, 25, 3, 17, 42, 8..."
        helperText={getHelperText()}
        variant="outlined"
        sx={{
          maxWidth: '600px',
        }}
      />

      <br />
      <br />

   <Button
          variant="contained"
          sx={{ backgroundColor: MOCK_OUTPUT, color: 'white', '&:hover': { backgroundColor: DARKER_GREEN } }}
           onClick={startSorting}
             disabled={hasError || numbers.length === 0}
        >
          GO!
        </Button>


</div>

  

      <div
        style={{
           padding:'20px',
          color: bubbleSorted ? TERMINAL_GREEN : 'black',
        }}
      >      <h2>Bubble Sort</h2>

        <Boxes numbers={bubble} />
      </div>


      <div
        style={{
             padding:'20px',
          color: insertionSorted ? TERMINAL_GREEN : 'black',
        }}
      > 
      <h2>Insertion Sort</h2>
        <Boxes numbers={insertion} />
      </div>

     {/* //TODO this is repetitive maybe i figure out how to do a map or a resuable component  */}

      <div
        style={{
           padding:'20px',
          color: mergeSorted ? TERMINAL_GREEN : 'black',
        }}
      >   
      <h2>Merge Sort</h2>
        <Boxes numbers={merge} />
      </div>
    </div>
  );
}

export default SortingVisualizer;