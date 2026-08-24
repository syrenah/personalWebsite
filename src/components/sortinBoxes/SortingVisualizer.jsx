import React, { useState } from 'react';


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
    throw new Error("sort() must be implemented");
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

          [result[j], result[j + 1]] =
            [result[j + 1], result[j]];

          this.setState([...result]);

          await this.sleep(100);
        }
      }
    }

    // Final state
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

      await this.sleep(100);
    }

    while (i < left.length) {
      result.push(left[i]);
      i++;
    }

    while (j < right.length) {
      result.push(right[j]);
      j++;
    }

    return result;
  }
}


// ========================
// React Component
// ========================

function SortingVisualizer() {

  const [input, setInput] = useState(
    '33, 6, 999, 1, 444, 6, 912, 0, 9, 6, 0, 2, 5, 7, 7, 5, 2, 8, 1, 3'
  );

  const parseNumbers = (value) => {
    return value
      .split(',')
      .map(number => Number(number.trim()))
      .filter(number => !Number.isNaN(number));
  };


  const original = parseNumbers(input);


  const [bubble, setBubble] = useState(original);
  const [insertion, setInsertion] = useState(original);
  const [merge, setMerge] = useState(original);


  const [bubbleSorted, setBubbleSorted] = useState(false);
  const [insertionSorted, setInsertionSorted] = useState(false);
  const [mergeSorted, setMergeSorted] = useState(false);


  // ========================
  // Change input
  // ========================

  const handleInputChange = (e) => {

    const value = e.target.value;

    setInput(value);

    const numbers = parseNumbers(value);

    setBubble(numbers);
    setInsertion(numbers);
    setMerge(numbers);

    setBubbleSorted(false);
    setInsertionSorted(false);
    setMergeSorted(false);
  };


  // ========================
  // Start sorting
  // ========================

  const startSorting = () => {

    const numbers = parseNumbers(input);

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


  return (
    <div>

      {/* ========================
          Number Input
      ======================== */}

      <h2>Numbers</h2>

      <textarea
        value={input}
        onChange={handleInputChange}
        rows={4}
        style={{
          width: '100%',
          maxWidth: '600px'
        }}
        placeholder="Enter numbers separated by commas"
      />


      <br />
      <br />


      <button onClick={startSorting}>
        Start
      </button>


      {/* ========================
          Bubble Sort
      ======================== */}

      <h2>Bubble Sort</h2>

      <div
        style={{
          color: bubbleSorted ? 'green' : 'black'
        }}
      >
        {bubble.map((number, index) => (
          <span key={index}>
            {number}{' '}
          </span>
        ))}
      </div>


      {/* ========================
          Insertion Sort
      ======================== */}

      <h2>Insertion Sort</h2>

      <div
        style={{
          color: insertionSorted ? 'green' : 'black'
        }}
      >
        {insertion.map((number, index) => (
          <span key={index}>
            {number}{' '}
          </span>
        ))}
      </div>


      {/* ========================
          Merge Sort
      ======================== */}

      <h2>Merge Sort</h2>

      <div
        style={{
          color: mergeSorted ? 'green' : 'black'
        }}
      >
        {merge.map((number, index) => (
          <span key={index}>
            {number}{' '}
          </span>
        ))}
      </div>

    </div>
  );
}


export default SortingVisualizer;