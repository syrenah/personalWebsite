import React from 'react';
import './PumpkinPieWealth.css';

const DEFAULT_PIES = [
  { label: 'Bottom 20%', wealth: 5 },
  { label: '20-40%', wealth: 8 },
  { label: '40-60%', wealth: 12 },
  { label: '60-80%', wealth: 20 },
  { label: 'Top 20%', wealth: 55 },
];

function PumpkinPie({ label, wealth }) {
  return (
    <div className="pumpkin-pie-card">
      <div className="pumpkin-pie" style={{ '--wealth': `${wealth}%` }}>
        <div className="pumpkin-pie-cream" />
      </div>
      <div className="pumpkin-pie-label">{label}</div>
      <div className="pumpkin-pie-wealth">{wealth}% of wealth</div>
    </div>
  );
}

function PumpkinPieWealth({
  pies = DEFAULT_PIES,
  title = 'Wealth Distribution',
  subtitle = 'How much of the wealth is held by each 20% of the population',
}) {
  return (
    <section className="pumpkin-pie-wealth">
      <h1>{title}</h1>
      <p className="pumpkin-pie-subtitle">{subtitle}</p>

      <div className="pumpkin-pies">
        {pies.map((pie) => (
          <PumpkinPie key={pie.label} {...pie} />
        ))}
      </div>

      <div className="pumpkin-pie-legend">
        <span className="pumpkin-pie-filled">●</span> Wealth held
        <span className="pumpkin-pie-remaining">●</span> Remaining share of the pie
      </div>
    </section>
  );
}

export { PumpkinPie, DEFAULT_PIES };
export default PumpkinPieWealth;