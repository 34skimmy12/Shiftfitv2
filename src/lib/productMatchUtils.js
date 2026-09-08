const PRODUCT_FAMILIES = [
  ["chicken", "chicken breast"], ["turkey", "turkey mince"], ["beef", "beef mince"], ["salmon", "salmon"], ["tuna", "tuna"], ["cod", "cod"],
  ["egg", "eggs"], ["greek yogurt", "greek yogurt"], ["cottage cheese", "cottage cheese"], ["skyr", "skyr"], ["whey", "whey protein"],
  ["milk", "milk"], ["oats", "oats"], ["rice", "rice"], ["quinoa", "quinoa"], ["potato", "potatoes"], ["sweet potato", "sweet potatoes"],
  ["toast", "wholegrain bread"], ["bread", "wholegrain bread"], ["wrap", "wholegrain wraps"], ["hummus", "hummus"], ["houmous", "hummus"],
  ["berries", "mixed berries"], ["berry", "mixed berries"], ["banana", "banana"], ["apple", "apple"], ["pear", "pear"], ["avocado", "avocado"],
  ["spinach", "spinach"], ["broccoli", "broccoli"], ["green beans", "green beans"], ["salad leaves", "salad leaves"], ["tomato", "tomatoes"],
  ["mixed vegetables", "mixed vegetables"], ["stir-fry", "stir-fry vegetables"], ["pepper", "peppers"], ["onion", "onions"],
  ["almonds", "almonds"], ["peanut butter", "peanut butter"], ["chia", "chia seeds"], ["pumpkin seeds", "pumpkin seeds"], ["sesame oil", "sesame oil"], ["olive oil", "olive oil"], ["honey", "honey"]
];

export function getProductFamily(name) {
  const text = String(name || "").trim().toLowerCase();
  const found = PRODUCT_FAMILIES.find(([needle]) => text.includes(needle));
  return found ? { key: found[1], label: found[1] } : null;
}
