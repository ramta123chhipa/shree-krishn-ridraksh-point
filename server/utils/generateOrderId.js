import crypto from 'crypto';

// e.g. SKRP-261003-7K3QX (date + 5 random characters)
const generateOrderNumber = () => {
  const d = new Date();
  const date = `${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  const rand = crypto.randomBytes(4).toString('hex').slice(0, 5).toUpperCase();
  return `SKRP-${date}-${rand}`;
};

export default generateOrderNumber;
