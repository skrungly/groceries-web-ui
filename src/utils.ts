export function shuffle<T>(array: T[]) {
  // shuffle in-place using Durstenfeld algorithm
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * i)

    let tmp = array[i]!
    array[i] = array[j]!
    array[j] = tmp
  }
}

export function sample_n<T>(array: T[], n: number): T[] {
  let array_copy = array.slice()
  shuffle(array_copy)
  return array_copy.slice(0, n)
}

export const FOOD_EMOJI = ['🍤', '🍑', '🌶', '🍣', '🍩', '🌯', '🥠', '🌮', '🫒', '🍢', '🥕', '🌰', '🥫', '🥭', '🥜', '🥘', '🫐', '🥐', '🍚', '🍋‍🟩', '🥣', '🍋', '🍠', '🧇', '🌽', '🍳', '🍖', '🍪', '🥟', '🥖', '🧆', '🎂', '🥓', '🍦', '🍛', '🍅', '🍊', '🍔', '🍿', '🍡', '🥒', '🧂', '🍧', '🍈', '🥚', '🍲', '🍏', '🫜', '🍍', '🌭', '🥪', '🥡', '🧄', '🍆', '🫕', '🥬', '🍥', '🥯', '🍭', '🍫', '🫘', '🍉', '🥝', '🧅', '🍕', '🫓', '🍰', '🍄‍🟫', '🥧', '🍞', '🥨', '🍯', '🍮', '🧈', '🥗', '🍒', '🫔', '🫑', '🥥', '🍇', '🥮', '🥩', '🍓', '🍙', '🍌', '🍜', '🍎', '🍬', '🍟', '🫚', '🍝', '🍐', '🥑', '🧀', '🥙', '🍨', '🫛', '🧁', '🍱', '🥦', '🥞', '🍄', '🥔', '🍘', '🍗']
