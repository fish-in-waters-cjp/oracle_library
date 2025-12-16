import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Input from '@/components/ui/input';

describe('Input 元件', () => {
  test('渲染基本輸入框', () => {
    render(<Input placeholder="請輸入..." />);
    expect(screen.getByPlaceholderText('請輸入...')).toBeInTheDocument();
  });

  test('顯示 label', () => {
    render(<Input label="電子郵件" placeholder="請輸入電子郵件" />);
    expect(screen.getByLabelText('電子郵件')).toBeInTheDocument();
  });

  test('label 點擊時聚焦 input', async () => {
    const user = userEvent.setup();
    render(<Input label="姓名" placeholder="請輸入姓名" />);

    const label = screen.getByText('姓名');
    const input = screen.getByPlaceholderText('請輸入姓名');

    await user.click(label);
    expect(input).toHaveFocus();
  });

  test('處理 onChange 事件', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(<Input placeholder="輸入" onChange={handleChange} />);
    const input = screen.getByPlaceholderText('輸入');

    await user.type(input, 'test');
    expect(handleChange).toHaveBeenCalled();
    expect(input).toHaveValue('test');
  });

  test('顯示錯誤狀態', () => {
    render(<Input placeholder="輸入" error="此欄位為必填" />);

    const input = screen.getByPlaceholderText('輸入');
    expect(input).toHaveClass('border-red-500');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('此欄位為必填')).toBeInTheDocument();
  });

  test('錯誤訊息與 input 關聯（無障礙）', () => {
    render(<Input placeholder="輸入" error="錯誤訊息" />);

    const input = screen.getByPlaceholderText('輸入');
    const errorId = input.getAttribute('aria-describedby');

    expect(errorId).toBeTruthy();
    expect(screen.getByText('錯誤訊息')).toHaveAttribute('id', errorId!);
  });

  test('disabled 狀態禁用輸入', () => {
    render(<Input placeholder="輸入" disabled />);

    const input = screen.getByPlaceholderText('輸入');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('cursor-not-allowed');
  });

  test('傳遞自訂 className', () => {
    render(<Input placeholder="輸入" className="custom-class" />);

    const input = screen.getByPlaceholderText('輸入');
    expect(input).toHaveClass('custom-class');
  });

  test('支援 value 和 onChange (受控元件)', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <Input value="initial" onChange={handleChange} placeholder="輸入" />
    );

    const input = screen.getByPlaceholderText('輸入');
    expect(input).toHaveValue('initial');

    await user.type(input, 'x');
    expect(handleChange).toHaveBeenCalled();
  });

  test('支援不同的 type 屬性', () => {
    const { rerender } = render(<Input type="email" placeholder="email" />);
    expect(screen.getByPlaceholderText('email')).toHaveAttribute('type', 'email');

    rerender(<Input type="password" placeholder="password" />);
    expect(screen.getByPlaceholderText('password')).toHaveAttribute('type', 'password');
  });

  test('required 屬性正確設定', () => {
    render(<Input placeholder="輸入" required />);
    expect(screen.getByPlaceholderText('輸入')).toBeRequired();
  });
});
