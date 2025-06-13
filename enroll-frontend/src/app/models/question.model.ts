export interface Question {
  id?: string;
  text: string;
  answer: string;
  note?: string;
  categoryId: string;
  categoryName?: string;
  point: number;
  imageUrl?: string;
}
