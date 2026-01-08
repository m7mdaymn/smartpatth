// merchant-customers.component.ts
import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth.service';
import { MerchantService } from '../../../core/services/merchant.service';
import { ToastService } from '../../../core/services/toast.service';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  plateNumber?: string;
  totalWashes: number;
  loyaltyPoints: number;
  isActive: boolean;
  createdAt: string;
}

@Component({
  selector: 'app-merchant-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './merchant-customers.component.html',
  styleUrls: ['./merchant-customers.component.css']
})
export class MerchantCustomersComponent implements OnInit, OnDestroy {
  // State
  customers = signal<Customer[]>([]);
  merchantId = signal<string>('');
  merchantPlan = signal<string>('basic');
  isLoading = signal<boolean>(false);
  isRefreshing = signal<boolean>(false);
  lastUpdated = signal<string>('');
  selectedCustomer = signal<Customer | null>(null);
  
  // UI States
  showEditModal = false;
  showDetailsModal = false;
  showConfirmModal = false;
  
  // Search and Filter
  searchTerm = '';
  filterStatus: 'all' | 'active' | 'inactive' = 'all';
  
  // Auto-refresh interval (30 seconds)
  private refreshInterval: any = null;
  
  // Computed values
  filteredCustomers = computed(() => {
    const allCustomers = this.customers();
    return allCustomers.filter(customer => {
      const matchesSearch = 
        customer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (customer.phone && customer.phone.includes(this.searchTerm)) ||
        (customer.plateNumber && customer.plateNumber.toLowerCase().includes(this.searchTerm.toLowerCase()));

      const matchesStatus = 
        this.filterStatus === 'all' ||
        (this.filterStatus === 'active' && customer.isActive) ||
        (this.filterStatus === 'inactive' && !customer.isActive);

      return matchesSearch && matchesStatus;
    });
  });
  
  // Forms
  editForm: FormGroup;
  
  // Confirmation Dialog
  confirmTitle = '';
  confirmMessage = '';
  confirmButtonText = '';
  confirmAction: (() => void) | null = null;
  
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private merchantService: MerchantService,
    private toast: ToastService
  ) {
    this.editForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      plateNumber: ['']
    });
  }

  ngOnInit() {
    this.loadMerchantAndCustomers();
  }

  // ==================== Data Loading ====================
  loadMerchantAndCustomers(): void {
    const user = this.authService.user();
    if (!user?.id) {
      this.toast.showError('يجب تسجيل الدخول أولاً');
      return;
    }

    this.isLoading.set(true);
    
    // Get merchant ID
    this.merchantService.getMerchantIdByUserId(user.id).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.merchantId.set(response.data);
          this.loadMerchantData();
          this.loadCustomers();
        } else {
          this.toast.showError('فشل في تحديد معرف التاجر');
          this.isLoading.set(false);
        }
      },
      error: (error) => {
        this.toast.showError('خطأ في تحميل بيانات التاجر');
        this.isLoading.set(false);
      }
    });
  }

  loadMerchantData(): void {
    const merchantId = this.merchantId();
    if (!merchantId) return;

    this.merchantService.getProfile(merchantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.merchantPlan.set(response.data.plan?.toLowerCase() || 'basic');
          }
        }
      });
  }

  loadCustomers(): void {
    const merchantId = this.merchantId();
    if (!merchantId) {
      console.warn('[CUSTOMERS] Merchant ID not set');
      return;
    }

    console.log('[CUSTOMERS] Loading for merchant:', merchantId);
    this.merchantService.getCustomers(merchantId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          console.log('[CUSTOMERS] API Response:', response);
          if (response.success && response.data && response.data.length > 0) {
            // Map backend data to frontend Customer interface
            const mappedCustomers = (response.data as any[]).map(c => ({
              id: c.id,
              name: c.name,
              email: c.email,
              phone: c.phone,
              plateNumber: c.plateNumber || c.carPlateNumber || c.carPlate || '',
              totalWashes: c.currentWashes || c.totalWashes || 0,
              loyaltyPoints: c.loyaltyPoints || 0,
              // Map 'status' string to 'isActive' boolean
              isActive: c.isActive !== undefined ? c.isActive : (c.status === 'active'),
              createdAt: c.joinDate || c.createdAt || ''
            }));
            console.log('[CUSTOMERS] Mapped ' + mappedCustomers.length + ' customers');
            this.customers.set(mappedCustomers);
            this.updateLastUpdated();
            if (!this.refreshInterval) {
              this.startAutoRefresh();
            }
          } else {
            console.warn('[CUSTOMERS] No data or empty response:', response);
            this.customers.set([]);
          }
          this.isLoading.set(false);
          this.isRefreshing.set(false);
        },
        error: (error) => {
          console.error('[CUSTOMERS] Error:', error);
          this.toast.showError('فشل في تحميل العملاء');
          this.isLoading.set(false);
          this.isRefreshing.set(false);
        }
      });
  }

  // Manual refresh with loading indicator
  refreshData(): void {
    this.isRefreshing.set(true);
    this.loadCustomers();
  }

  // Update last updated time
  private updateLastUpdated(): void {
    const now = new Date();
    this.lastUpdated.set(now.toLocaleTimeString('ar-SA', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }));
  }

  // Start auto-refresh (call from ngOnInit after data loads)
  private startAutoRefresh(): void {
    // Refresh every 30 seconds
    this.refreshInterval = setInterval(() => {
      this.loadCustomers();
    }, 30000);
  }

  // ==================== Filtering & Searching ====================
  onSearchChange(): void {
    // Filtering is handled by computed signal
  }

  getActiveCustomersCount(): number {
    return this.filteredCustomers().filter(c => c.isActive).length;
  }

  activeCustomersCount = computed(() => 
    this.filteredCustomers().filter(c => c.isActive).length
  );

  // ==================== Customer Plan Checks ====================
  isBasicPlan(): boolean {
    return this.merchantPlan() === 'basic';
  }

  // ==================== Modal Controls ====================
  openEditCustomerModal(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.editForm.patchValue({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      plateNumber: customer.plateNumber || ''
    });
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedCustomer.set(null);
    this.editForm.reset();
  }

  viewCustomer(customer: Customer): void {
    this.selectedCustomer.set(customer);
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedCustomer.set(null);
  }

  // ==================== CRUD Operations ====================
  saveEdit(): void {
    const selectedCustomer = this.selectedCustomer();
    if (this.editForm.invalid || !selectedCustomer) {
      this.toast.showError('يرجى ملء جميع الحقول بشكل صحيح');
      return;
    }

    const merchantId = this.merchantId();
    if (!merchantId) {
      this.toast.showError('خطأ: معرف التاجر غير متوفر');
      return;
    }

    this.isLoading.set(true);
    const updateData = {
      name: this.editForm.get('name')?.value,
      email: this.editForm.get('email')?.value,
      phone: this.editForm.get('phone')?.value,
      plateNumber: this.editForm.get('plateNumber')?.value,
    };

    // Update customer via MerchantService if available, otherwise use direct API
    this.merchantService.updateCustomer(merchantId, selectedCustomer.id, updateData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.toast.showSuccess('تم تحديث العميل بنجاح');
            this.closeEditModal();
            this.loadCustomers();
          } else {
            this.toast.showError(response?.message || 'فشل في تحديث العميل');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toast.showError('فشل في تحديث العميل');
          this.isLoading.set(false);
        }
      });
  }

  // ==================== Confirmation Dialogs ====================
  confirmDeactivate(customer: Customer): void {
    this.confirmTitle = 'إيقاف العميل';
    this.confirmMessage = `هل أنت متأكد من إيقاف ${customer.name}؟`;
    this.confirmButtonText = 'إيقاف';
    this.confirmAction = () => this.toggleCustomerStatus(customer, false);
    this.showConfirmModal = true;
  }

  confirmActivate(customer: Customer): void {
    this.confirmTitle = 'تفعيل العميل';
    this.confirmMessage = `هل أنت متأكد من تفعيل ${customer.name}؟`;
    this.confirmButtonText = 'تفعيل';
    this.confirmAction = () => this.toggleCustomerStatus(customer, true);
    this.showConfirmModal = true;
  }

  confirmDelete(customer: Customer): void {
    this.confirmTitle = 'حذف العميل';
    this.confirmMessage = `هل أنت متأكد من حذف ${customer.name} نهائياً؟`;
    this.confirmButtonText = 'حذف';
    this.confirmAction = () => this.deleteCustomer(customer);
    this.showConfirmModal = true;
  }

  toggleCustomerStatus(customer: Customer, activate: boolean): void {
    const merchantId = this.merchantId();
    if (!merchantId) {
      this.toast.showError('خطأ: معرف التاجر غير متوفر');
      return;
    }

    this.isLoading.set(true);
    const endpoint = activate ? 'activate' : 'deactivate';
    
    this.merchantService.toggleCustomerStatus(merchantId, customer.id, activate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            const message = activate ? 'تم تفعيل العميل بنجاح' : 'تم تعطيل العميل بنجاح';
            this.toast.showSuccess(message);
            this.cancelOperation();
            this.loadCustomers();
          } else {
            const errorMsg = activate ? 'فشل في تفعيل العميل' : 'فشل في تعطيل العميل';
            this.toast.showError(errorMsg);
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          const errorMsg = activate ? 'فشل في تفعيل العميل' : 'فشل في تعطيل العميل';
          this.toast.showError(errorMsg);
          this.isLoading.set(false);
        }
      });
  }

  deleteCustomer(customer: Customer): void {
    const merchantId = this.merchantId();
    if (!merchantId) {
      this.toast.showError('خطأ: معرف التاجر غير متوفر');
      return;
    }

    this.isLoading.set(true);
    
    this.merchantService.deleteCustomer(merchantId, customer.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          if (response?.success) {
            this.toast.showSuccess('تم حذف العميل بنجاح');
            this.cancelOperation();
            this.loadCustomers();
          } else {
            this.toast.showError('فشل في حذف العميل');
          }
          this.isLoading.set(false);
        },
        error: (error) => {
          this.toast.showError('فشل في حذف العميل');
          this.isLoading.set(false);
        }
      });
  }

  // ==================== Confirmation Dialog ====================
  confirmOperation(): void {
    if (this.confirmAction) {
      this.confirmAction();
      this.confirmAction = null;
    }
  }

  cancelOperation(): void {
    this.showConfirmModal = false;
    this.confirmAction = null;
  }

  // ==================== Helper Methods ====================
  goBack(): void {
    window.history.back();
  }

  // ==================== Cleanup ====================
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    // Clear auto-refresh interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
  }
}