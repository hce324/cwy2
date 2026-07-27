// 凭证编号自动生成
// 格式：{字}{月}{流水号}，如 转字128号、收字015号

const WORD_PREFIX: Record<string, string> = {
  '收': '收字',
  '付': '付字',
  '转': '转字',
};

export async function generateVoucherNo(
  db: any,
  word: '收' | '付' | '转',
  companyId: number,
): Promise<string> {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();

  // 查当月该类凭证最大号
  const latest = await db.accountingVoucher.findFirst({
    where: {
      company_id: companyId,
      voucher_word: word,
      voucher_date: {
        gte: new Date(`${year}-${month}-01`),
      },
    },
    orderBy: { voucher_number: 'desc' },
    select: { voucher_number: true },
  });

  const nextNumber = (latest?.voucher_number ?? 0) + 1;
  const paddedNumber = String(nextNumber).padStart(3, '0');

  return `${WORD_PREFIX[word]}${paddedNumber}号`;
}
