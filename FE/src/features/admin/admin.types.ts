import type { Role } from '@/features/auth/auth.types'

export interface VaiTro {
  maVaiTro: number
  tenVaiTro: Role
  moTa: string
}

export interface DonVi {
  maDonVi: number
  tenDonVi: string
  loaiDonVi: Exclude<Role, 'Admin'>
  diaChi: string
  soDienThoai: string
  maSoThue: string
  trangThai: 'Active' | 'Inactive'
}

export interface NguoiDung {
  maNguoiDung: number
  maVaiTro: number
  maDonVi: number | null
  tenDangNhap: string
  email: string
  hoTen: string
  ngayTao: string
  trangThai: 'Active' | 'Inactive'
}

export interface SanPham {
  maSanPham: number
  tenSanPham: string
  donViTinh: string
  moTa: string
}

export interface LoHang {
  maLoHang: number
  maSanPham: number
  maDonViSanXuat: number
  maLoHangCha: number | null
  maQR: string
  ngayThuHoach: string
  khoiLuong: number

  trangThai:
    | 'Created'
    | 'InTransit'
    | 'Processed'
    | 'Distributed'
    | 'Recalled'

  ngayTao: string
}

export interface SuKien {
  maSuKien: number
  maLoHang: number
  maDonViThucHien: number
  maNguoiThucHien: number
  maSuKienTruoc: number | null

  loaiSuKien:
    | 'Harvest'
    | 'Process'
    | 'Package'
    | 'Transport'
    | 'Retail'

  thoiGian: string
  viTri: string
  duLieuBoSung: string
  maHash: string
  maHashTruoc: string | null
}

export interface KiemDinh {
  maKiemDinh: number
  maLoHang: number
  maDonViKiemDinh: number
  ketQua: 'Passed' | 'Failed'
  ngayKiemDinh: string
  ghiChu: string
}

export interface ChungNhan {
  maChungNhan: number
  maLoHang: number
  maKiemDinh: number | null

  loaiChungNhan:
    | 'VietGAP'
    | 'GlobalGAP'
    | 'Organic'
    | 'HACCP'

  fileChungNhanUrl: string
  donViCap: string
  ngayCap: string
  ngayHetHan: string
}

export interface CanhBaoThuHoi {
  maCanhBao: number
  maLoHang: number
  maNguoiTao: number
  lyDo: string

  mucDoNghiemTrong:
    | 'Low'
    | 'Medium'
    | 'High'
    | 'Critical'

  thoiGianTao: string

  trangThai:
    | 'Active'
    | 'Resolved'
    | 'Cancelled'
}

export interface ThongBaoThuHoi {
  maThongBao: number
  maCanhBao: number
  maDonVi: number
  thoiGianGui: string

  trangThaiXacNhan:
    | 'Pending'
    | 'Acknowledged'
    | 'Processed'

  ghiChuXuLy: string
}

export interface NguoiDungFormData {
  maVaiTro: number
  maDonVi: number | null
  tenDangNhap: string
  email: string
  hoTen: string
  trangThai: NguoiDung['trangThai']
}