// src/app/components/students/student-list/student-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { StudentService } from '../../../services/student.service';
import { MockStudentService } from '../../../services/mock-student.service';
import { NotificationService } from '../../../services/notification.service';
import { Student } from '../../../models/student.model';
import { ListViewComponent } from '../../shared/list-view/list-view.component';
import { SharedService, ListItem } from '../../../services/shared.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    FormsModule,
    ListViewComponent
  ],
  templateUrl: './student-list.component.html',
  styleUrl: './student-list.component.css'
})
export class StudentListComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  listItems: ListItem[] = [];
  loading = false;
  
  // Search and filter properties
  searchTerm = '';
  selectedClass = '';
  selectedStatus = '';
  private searchSubject = new Subject<string>();
  
  // List view configuration
  tabs = [
    { label: 'All Students', value: 'all', count: 0 },
    { label: 'Active', value: 'active', count: 0 },
    { label: 'Inactive', value: 'inactive', count: 0 },
    { label: 'Suspended', value: 'suspended', count: 0 }
  ];

  filterOptions = [
    {
      label: 'Program',
      value: 'program',
      options: [
        { label: 'All Programs', value: 'all' },
        { label: 'BDS', value: 'BDS' },
        { label: 'MDS', value: 'MDS' },
        { label: 'Certificate', value: 'Certificate' }
      ]
    },
    {
      label: 'Year',
      value: 'year',
      options: [
        { label: 'All Years', value: 'all' },
        { label: '1st Year', value: '1' },
        { label: '2nd Year', value: '2' },
        { label: '3rd Year', value: '3' },
        { label: '4th Year', value: '4' }
      ]
    }
  ];

  constructor(
    private studentService: StudentService,
    private mockStudentService: MockStudentService,
    private notificationService: NotificationService,
    public router: Router,
    private sharedService: SharedService
  ) {
    // Setup search debouncing
    this.searchSubject.pipe(
      debounceTime(300)
    ).subscribe(searchTerm => {
      this.performSearch(searchTerm);
    });
  }

  ngOnInit() {
    this.loadStudents();
  }

  loadStudents() {
    this.loading = true;
    
    // Build query for API - ALL filtering happens on backend
    const apiQuery: any = {};
    
    // Add search term if present
    if (this.searchTerm && this.searchTerm.trim()) {
      apiQuery.search = this.searchTerm.trim();
    }
    
    // Add status filter (from tabs)
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      apiQuery.status = this.selectedStatus;
    }
    
    // Add program filter
    if (this.selectedClass && this.selectedClass !== 'all') {
      apiQuery.programName = this.selectedClass;
    }

    console.log('Loading students with filters:', apiQuery);

    if (environment.useMockData) {
      const mockQuery = { ...apiQuery, program: apiQuery.programName };
      delete mockQuery.programName;
      
      this.mockStudentService.getStudents(mockQuery).subscribe({
        next: (response) => {
          this.students = response.students || [];
          this.convertStudentsToListItems();
          this.updateTabCounts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading mock students:', error);
          this.notificationService.showError('Failed to load student data');
          this.loading = false;
          this.students = [];
          this.listItems = [];
        }
      });
    } else {
      // Real API call - backend handles all filtering
      this.studentService.getStudents(apiQuery).subscribe({
        next: (response) => {
          console.log('Students loaded from API:', response);
          this.students = response.students || [];
          this.convertStudentsToListItems();
          this.updateTabCounts();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading students:', error);
          this.notificationService.showError('Failed to load student data');
          this.loading = false;
          this.students = [];
          this.listItems = [];
        }
      });
    }
  }

  convertStudentsToListItems() {
    this.listItems = this.students.map(student => {
      // Map student status to ListItem status format
      const statusMap: Record<string, 'Active' | 'Inactive' | 'Pending' | 'Draft'> = {
        'active': 'Active',
        'inactive': 'Inactive',
        'suspended': 'Pending',
        'graduated': 'Draft'
      };
      
      // Build full name from firstName and lastName
      const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ') || 'N/A';
      
      return {
        id: student._id || '',
        title: fullName,
        subtitle: `${student.studentId || 'N/A'} • Sem ${student.semester || 'N/A'}`,
        description: `${student.programName || 'BDS'} • ${student.academicYear || 'Current Year'}`,
        status: statusMap[student.status] || 'Active',
        tags: [
          student.programName || 'BDS',
          student.bloodGroup || 'Unknown',
          student.studentType || 'Regular'
        ],
        metadata: [
          { label: 'Phone', value: this.sharedService.formatPhoneNumber(student.contactNumber) },
          { label: 'Email', value: student.email || 'Not provided' },
          { label: 'Enrollment', value: student.enrollmentNumber || 'Not assigned' },
          { label: 'Guardian', value: student.guardianName || 'Not provided' }
        ]
      };
    });
  }

  updateTabCounts() {
    // For accurate counts, we need to fetch from backend
    // However, for now, calculate from current filtered results
    // TODO: Implement dedicated API endpoint for status counts
    
    if (this.selectedStatus && this.selectedStatus !== 'all') {
      // When filtered by status, only show that status count
      this.tabs = [
        { label: 'All Students', value: 'all', count: 0 },
        { label: 'Active', value: 'active', count: this.selectedStatus === 'active' ? this.students.length : 0 },
        { label: 'Inactive', value: 'inactive', count: this.selectedStatus === 'inactive' ? this.students.length : 0 },
        { label: 'Suspended', value: 'suspended', count: this.selectedStatus === 'suspended' ? this.students.length : 0 }
      ];
    } else {
      // When showing all, calculate from current results
      const statusCounts = this.students.reduce((acc, student) => {
        const status = student.status || 'active';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      this.tabs = [
        { label: 'All Students', value: 'all', count: this.students.length },
        { label: 'Active', value: 'active', count: statusCounts['active'] || 0 },
        { label: 'Inactive', value: 'inactive', count: statusCounts['inactive'] || 0 },
        { label: 'Suspended', value: 'suspended', count: statusCounts['suspended'] || 0 }
      ];
    }
  }

  // List View Event Handlers
  onSearchChange(searchTerm: string) {
    this.searchTerm = searchTerm;
    this.searchSubject.next(searchTerm);
  }

  performSearch(searchTerm: string) {
    // Reload from API with search term - backend handles search
    this.searchTerm = searchTerm;
    this.loadStudents();
  }

  onFilterChange(filters: any) {
    console.log('Filter changed:', filters);
    this.selectedClass = filters.program || '';
    // Reload from API with new filters
    this.loadStudents();
  }

  onTabChange(tab: string) {
    console.log('Tab changed:', tab);
    this.selectedStatus = tab === 'all' ? '' : tab;
    // Reload from API with new status filter
    this.loadStudents();
  }

  onAddClick() {
    this.router.navigate(['/students/new']);
  }

  onItemClick(item: ListItem) {
    this.router.navigate(['/students', item.id]);
  }

  onActionClick(event: { action: string; item: ListItem }) {
    const student = this.students.find(s => s._id === event.item.id);
    if (!student) return;

    if (event.action === 'delete') {
      this.deleteStudent(student);
      return;
    }

    if (event.action === 'view') {
      this.router.navigate(['/students', student._id]);
      return;
    }

    if (event.action === 'edit') {
      this.router.navigate(['/students', student._id, 'edit']);
      return;
    }

    if (event.action === 'fees') {
      this.router.navigate(['/fees/student', student._id]);
      return;
    }
  }

  // Thin handlers for template-bound events
  onView(id: string) { this.router.navigate(['/students', id]); }
  onEdit(id: string) { this.router.navigate(['/students', id, 'edit']); }
  onDeleteById(id: string) {
    const student = this.students.find(s => s._id === id);
    if (student) {
      this.deleteStudent(student);
    }
  }

  deleteStudent(student: Student) {
    const studentName = [student.firstName, student.lastName].filter(Boolean).join(' ') || 'this student';
    if (confirm(`Are you sure you want to delete student ${studentName}?`)) {
      this.loading = true;
      
      this.studentService.deleteStudent(student._id!).subscribe({
        next: () => {
          this.notificationService.showSuccess('Student deleted successfully');
          this.loadStudents();
        },
        error: (error) => {
          console.error('Error deleting student:', error);
          this.notificationService.showError('Failed to delete student');
          this.loading = false;
        }
      });
    }
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10b981'; // Green for active students
      case 'inactive':
        return '#f59e0b'; // Amber for leave of absence
      case 'suspended':
        return '#ef4444'; // Red for academic probation
      case 'graduated':
        return '#3b82f6'; // Blue for graduated BDS
      case 'internship':
        return '#8b5cf6'; // Purple for internship
      case 'dropped':
        return '#6b7280'; // Gray for dropped out
      case 'transferred':
        return '#06b6d4'; // Cyan for transferred
      default:
        return '#6b7280';
    }
  }

  exportStudents() {
    // TODO: Implement export functionality
    this.notificationService.showInfo('Export functionality coming soon');
  }
}