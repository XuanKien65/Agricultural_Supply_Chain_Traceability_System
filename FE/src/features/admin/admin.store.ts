import { create } from 'zustand'

import {
  mockCanhBaoThuHois,
  mockChungNhans,
  mockDonVis,
  mockKiemDinhs,
  mockLoHangs,
  mockNguoiDungs,
  mockSanPhams,
  mockSuKiens,
  mockThongBaoThuHois,
  mockVaiTros,
} from './admin.mock'

import type {
  CanhBaoThuHoi,
  ChungNhan,
  DonVi,
  KiemDinh,
  LoHang,
  NguoiDung,
  NguoiDungFormData,
  SanPham,
  SuKien,
  ThongBaoThuHoi,
  VaiTro,
} from './admin.types'

interface AdminState {
  vaiTros: VaiTro[]
  donVis: DonVi[]
  nguoiDungs: NguoiDung[]
  sanPhams: SanPham[]
  loHangs: LoHang[]
  suKiens: SuKien[]
  kiemDinhs: KiemDinh[]
  chungNhans: ChungNhan[]
  canhBaoThuHois: CanhBaoThuHoi[]
  thongBaoThuHois: ThongBaoThuHoi[]

  addNguoiDung: (
    data: NguoiDungFormData,
  ) => void

  updateNguoiDung: (
    id: number,
    data: NguoiDungFormData,
  ) => void

  deleteNguoiDung: (
    id: number,
  ) => void

  resolveCanhBao: (
    id: number,
  ) => void
}

export const useAdminStore =
  create<AdminState>((set) => ({
    vaiTros: mockVaiTros,
    donVis: mockDonVis,
    nguoiDungs: mockNguoiDungs,
    sanPhams: mockSanPhams,
    loHangs: mockLoHangs,
    suKiens: mockSuKiens,
    kiemDinhs: mockKiemDinhs,
    chungNhans: mockChungNhans,
    canhBaoThuHois:
      mockCanhBaoThuHois,
    thongBaoThuHois:
      mockThongBaoThuHois,

    addNguoiDung: (data) =>
      set((state) => ({
        nguoiDungs: [
          {
            maNguoiDung:
              Math.max(
                0,
                ...state.nguoiDungs.map(
                  (item) =>
                    item.maNguoiDung,
                ),
              ) + 1,

            ...data,

            ngayTao: new Date()
              .toISOString()
              .slice(0, 10),
          },

          ...state.nguoiDungs,
        ],
      })),

    updateNguoiDung:
      (id, data) =>
        set((state) => ({
          nguoiDungs:
            state.nguoiDungs.map(
              (item) =>
                item.maNguoiDung === id
                  ? {
                      ...item,
                      ...data,
                    }
                  : item,
            ),
        })),

    deleteNguoiDung: (id) =>
      set((state) => ({
        nguoiDungs:
          state.nguoiDungs.filter(
            (item) =>
              item.maNguoiDung !== id,
          ),
      })),

    resolveCanhBao: (id) =>
      set((state) => ({
        canhBaoThuHois:
          state.canhBaoThuHois.map(
            (item) =>
              item.maCanhBao === id
                ? {
                    ...item,
                    trangThai:
                      'Resolved',
                  }
                : item,
          ),
      })),
  }))