'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface AcademicSession { id: number; name: string; is_current?: boolean; }
interface SchoolClass { id: number; level_name: string; arm_name: string; full_name: string; teacher_id: number | null; }
interface Staff { id: number; first_name: string; last_name: string; user?: { first_name: string, last_name: string } }
interface Subject { id: number; name: string; category?: { name: string } }
interface ClassSubject { id?: number; subject_id: number; staff_id: number | null; is_compulsory: boolean; order: number; subject?: Subject; }

export default function ClassSubjectsAssignmentsPage() {
    const [sessions, setSessions] = useState<AcademicSession[]>([]);
    const [classes, setClasses] = useState<SchoolClass[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [staffList, setStaffList] = useState<Staff[]>([]);

    const [selectedSessionId, setSelectedSessionId] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    const [assignedSubjects, setAssignedSubjects] = useState<ClassSubject[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Modal state for adding subject
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newSubjectForm, setNewSubjectForm] = useState<{ subject_ids: string[], staff_id: string, is_compulsory: boolean }>({ subject_ids: [], staff_id: '', is_compulsory: true });

    // Copy modal state
    const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
    const [copyFromClassId, setCopyFromClassId] = useState('');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [sessionsRes, classesRes, subjectsRes, staffRes] = await Promise.all([
                axios.get('http://localhost:8000/api/academic-sessions', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/school-classes', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/subjects', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/staff', { headers: { Authorization: `Bearer ${token}` } }),
            ]);
            
            const sessionsData = sessionsRes.data.academic_sessions || sessionsRes.data;
            const classesData = classesRes.data.school_classes || classesRes.data;
            const subjectsData = subjectsRes.data;
            const staffData = staffRes.data.staff?.data || staffRes.data.staff || staffRes.data;

            setSessions(sessionsData);
            setClasses(classesData);
            setSubjects(subjectsData);
            setStaffList(staffData);

            // Auto-select current session if available
            const currentSession = sessionsData.find((s: any) => s.status === 'active') || sessionsData[0];
            if (currentSession) setSelectedSessionId(currentSession.id.toString());
        } catch (error) {
            toast.error('Failed to load initial data');
        }
    };

    useEffect(() => {
        if (selectedSessionId && selectedClassId) {
            fetchAssignments();
        } else {
            setAssignedSubjects([]);
        }
    }, [selectedSessionId, selectedClassId]);

    const fetchAssignments = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`http://localhost:8000/api/class-subjects?academic_session_id=${selectedSessionId}&school_class_id=${selectedClassId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAssignedSubjects(response.data);
        } catch (error) {
            toast.error('Failed to load assignments');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveAssignments = async () => {
        setIsSaving(true);
        try {
            const token = localStorage.getItem('token');
            const payload = {
                academic_session_id: selectedSessionId,
                school_class_id: selectedClassId,
                subjects: assignedSubjects.map((as, index) => ({
                    subject_id: as.subject_id,
                    staff_id: as.staff_id || null,
                    is_compulsory: as.is_compulsory,
                    order: index
                }))
            };

            await axios.post('http://localhost:8000/api/class-subjects', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Assignments saved successfully');
            fetchAssignments();
        } catch (error) {
            toast.error('Failed to save assignments');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCopyAssignments = async () => {
        if (!copyFromClassId || copyFromClassId === selectedClassId) {
            toast.error('Please select a different class to copy from');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/api/class-subjects/copy', {
                academic_session_id: selectedSessionId,
                from_school_class_id: copyFromClassId,
                to_school_class_id: selectedClassId
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Assignments copied successfully');
            setIsCopyModalOpen(false);
            fetchAssignments();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to copy assignments');
        }
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 7;

    const filteredAssignments = assignedSubjects.filter(as => 
        as.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (as.subject?.category?.name && as.subject.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const totalPages = Math.max(1, Math.ceil(filteredAssignments.length / itemsPerPage));
    const paginatedAssignments = filteredAssignments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const draggedItem = paginatedAssignments[result.source.index];
        const targetItem = paginatedAssignments[result.destination.index];

        const sourceIndex = assignedSubjects.findIndex(as => as.subject_id === draggedItem.subject_id);
        const destinationIndex = assignedSubjects.findIndex(as => as.subject_id === targetItem.subject_id);

        const items = Array.from(assignedSubjects);
        const [reorderedItem] = items.splice(sourceIndex, 1);
        items.splice(destinationIndex, 0, reorderedItem);
        
        // Update order property
        const updatedItems = items.map((item, index) => ({ ...item, order: index }));
        setAssignedSubjects(updatedItems);
    };

    const handleAddSubject = (e: React.FormEvent) => {
        e.preventDefault();
        if (newSubjectForm.subject_ids.length === 0) {
            toast.error('Please select at least one subject');
            return;
        }

        const newAssignments: ClassSubject[] = [];
        let skipped = 0;

        newSubjectForm.subject_ids.forEach(id => {
            if (assignedSubjects.find(s => s.subject_id.toString() === id)) {
                skipped++;
                return;
            }
            const subjectDetails = subjects.find(s => s.id.toString() === id);
            if (!subjectDetails) return;

            newAssignments.push({
                subject_id: subjectDetails.id,
                staff_id: newSubjectForm.staff_id ? parseInt(newSubjectForm.staff_id) : null,
                is_compulsory: newSubjectForm.is_compulsory,
                order: assignedSubjects.length + newAssignments.length,
                subject: subjectDetails
            });
        });

        if (newAssignments.length > 0) {
            setAssignedSubjects([...assignedSubjects, ...newAssignments]);
            if (skipped > 0) {
                toast.success(`Added ${newAssignments.length} subject(s). ${skipped} skipped (already assigned).`);
            } else {
                toast.success(`Added ${newAssignments.length} subject(s) successfully.`);
            }
        } else if (skipped > 0) {
            toast.error('All selected subjects are already assigned.');
        }

        setIsModalOpen(false);
        setNewSubjectForm({ subject_ids: [], staff_id: '', is_compulsory: true });
    };

    const handleRemoveSubjectGlobal = (subjectId: number) => {
        const newSubjects = assignedSubjects.filter(s => s.subject_id !== subjectId);
        setAssignedSubjects(newSubjects);
    };

    const updateSubjectFieldGlobal = (subjectId: number, field: keyof ClassSubject, value: any) => {
        const newSubjects = assignedSubjects.map(s => s.subject_id === subjectId ? { ...s, [field]: value } : s);
        setAssignedSubjects(newSubjects);
    };

    const assignAllToFormTeacher = () => {
        const currentClass = classes.find(c => c.id.toString() === selectedClassId);
        if (!currentClass?.teacher_id) {
            toast.error('This class does not have a form teacher assigned');
            return;
        }

        const newSubjects = assignedSubjects.map(s => ({
            ...s,
            staff_id: currentClass.teacher_id
        }));
        setAssignedSubjects(newSubjects);
        toast.success('Assigned form teacher to all subjects in the list (Save to apply)');
    };

    // Filter logic
    const uniqueLevels = Array.from(new Set(classes.map(c => c.level_name)));
    const armsForSelectedLevel = classes.filter(c => c.level_name === selectedLevel);
    const unassignedSubjects = subjects.filter(sub => !assignedSubjects.find(as => as.subject_id === sub.id));

    return (
        <div className="space-y-6 pb-20">
            {/* Selection Flow Card */}
            <div className="bg-surface-container rounded-2xl p-6 border border-outline/20">
                <h2 className="text-lg font-semibold text-on-surface mb-4">Class Selection</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Academic Session</label>
                        <select 
                            value={selectedSessionId} 
                            onChange={(e) => setSelectedSessionId(e.target.value)}
                            className="w-full px-4 py-2 bg-surface-container-high rounded-lg border border-outline/20 text-on-surface appearance-none"
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Class Level</label>
                        <select 
                            value={selectedLevel} 
                            onChange={(e) => {
                                setSelectedLevel(e.target.value);
                                setSelectedClassId('');
                            }}
                            className="w-full px-4 py-2 bg-surface-container-high rounded-lg border border-outline/20 text-on-surface appearance-none"
                        >
                            <option value="">Select Level</option>
                            {uniqueLevels.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-on-surface-variant mb-1">Class Arm</label>
                        <select 
                            value={selectedClassId} 
                            onChange={(e) => setSelectedClassId(e.target.value)}
                            disabled={!selectedLevel}
                            className="w-full px-4 py-2 bg-surface-container-high rounded-lg border border-outline/20 text-on-surface appearance-none disabled:opacity-50"
                        >
                            <option value="">Select Arm</option>
                            {armsForSelectedLevel.map(c => <option key={c.id} value={c.id}>{c.arm_name} ({c.full_name})</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {selectedSessionId && selectedClassId && (
                <div className="bg-surface-container rounded-2xl border border-outline/20 overflow-hidden">
                    <div className="p-4 border-b border-outline/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-high">
                        <h3 className="font-semibold text-on-surface flex items-center gap-2">
                            Assigned Subjects
                            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs">{assignedSubjects.length}</span>
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            <button 
                                onClick={assignAllToFormTeacher}
                                className="px-3 py-1.5 text-xs font-medium bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface rounded-lg transition-colors"
                            >
                                Assign Form Teacher to All
                            </button>
                            <button 
                                onClick={() => setIsCopyModalOpen(true)}
                                className="px-3 py-1.5 text-xs font-medium bg-surface-container-highest hover:bg-surface-container-highest/80 text-on-surface rounded-lg transition-colors"
                            >
                                Copy From Another Class
                            </button>
                            <button 
                                onClick={() => setIsModalOpen(true)}
                                className="px-3 py-1.5 text-xs font-medium bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
                            >
                                + Add Subject
                            </button>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="p-8 text-center text-on-surface-variant animate-pulse">Loading assignments...</div>
                    ) : (
                        <div className="p-0">
                            {assignedSubjects.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="text-4xl mb-3 opacity-50">📚</div>
                                    <p className="text-on-surface-variant">No subjects assigned yet.</p>
                                    <button 
                                        onClick={() => setIsModalOpen(true)}
                                        className="mt-4 text-primary hover:underline text-sm font-medium"
                                    >
                                        Add the first subject
                                    </button>
                                </div>
                            ) : (
                                <div>
                                    <div className="px-4 py-3 bg-surface-container-highest border-b border-outline/10">
                                        <input
                                            type="text"
                                            placeholder="Search assigned subjects..."
                                            value={searchQuery}
                                            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                            className="w-full md:w-64 px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-sm focus:outline-none focus:border-primary text-on-surface"
                                        />
                                    </div>
                                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-surface-container-highest/50 text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                                        <div className="col-span-1 text-center">Order</div>
                                        <div className="col-span-4">Subject Details</div>
                                        <div className="col-span-3">Assigned Teacher</div>
                                        <div className="col-span-3 text-center">Type</div>
                                        <div className="col-span-1 text-right">Actions</div>
                                    </div>
                                    <DragDropContext onDragEnd={handleDragEnd}>
                                        <Droppable droppableId="subjects-list">
                                            {(provided) => (
                                                <div {...provided.droppableProps} ref={provided.innerRef} className="divide-y divide-outline/10">
                                                    {paginatedAssignments.map((assignment, index) => (
                                                        <Draggable key={assignment.subject_id.toString()} draggableId={assignment.subject_id.toString()} index={index}>
                                                            {(provided, snapshot) => (
                                                                <div 
                                                                    ref={provided.innerRef} 
                                                                    {...provided.draggableProps} 
                                                                    className={`grid grid-cols-12 gap-4 px-6 py-4 items-center group transition-colors ${snapshot.isDragging ? 'bg-surface-container-highest shadow-lg' : 'hover:bg-surface-container-high/50 bg-surface-container'}`}
                                                                >
                                                                    <div className="col-span-1 flex justify-center text-on-surface-variant/50 group-hover:text-on-surface-variant cursor-grab active:cursor-grabbing" {...provided.dragHandleProps}>
                                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16"></path></svg>
                                                                    </div>
                                                                    
                                                                    <div className="col-span-4">
                                                                        <div className="font-medium text-on-surface">{assignment.subject?.name}</div>
                                                                        <div className="text-xs text-on-surface-variant">{assignment.subject?.category?.name || 'General'}</div>
                                                                    </div>

                                                                    <div className="col-span-3">
                                                                        <select 
                                                                            value={assignment.staff_id || ''} 
                                                                            onChange={(e) => updateSubjectFieldGlobal(assignment.subject_id, 'staff_id', e.target.value ? parseInt(e.target.value) : null)}
                                                                            className="w-full px-2 py-1.5 text-sm bg-surface-container-lowest rounded border border-outline/20 text-on-surface focus:outline-none focus:border-primary appearance-none"
                                                                        >
                                                                            <option value="">No Teacher</option>
                                                                            {staffList.map(staff => (
                                                                                <option key={staff.id} value={staff.id}>
                                                                                    {staff.user?.first_name || staff.first_name} {staff.user?.last_name || staff.last_name}
                                                                                </option>
                                                                            ))}
                                                                        </select>
                                                                    </div>

                                                                    <div className="col-span-3 flex justify-center">
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input 
                                                                                type="checkbox" 
                                                                                className="sr-only peer"
                                                                                checked={assignment.is_compulsory}
                                                                                onChange={(e) => updateSubjectFieldGlobal(assignment.subject_id, 'is_compulsory', e.target.checked)}
                                                                            />
                                                                            <div className="w-9 h-5 bg-surface-container-lowest peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                                                            <span className="ml-2 text-xs font-medium text-on-surface-variant min-w-[70px]">
                                                                                {assignment.is_compulsory ? 'Compulsory' : 'Elective'}
                                                                            </span>
                                                                        </label>
                                                                    </div>

                                                                    <div className="col-span-1 flex justify-end">
                                                                        <button 
                                                                            onClick={() => handleRemoveSubjectGlobal(assignment.subject_id)}
                                                                            className="p-1.5 text-on-surface-variant hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                                                                            title="Remove from class"
                                                                        >
                                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </Draggable>
                                                    ))}
                                                    {provided.placeholder}
                                                </div>
                                            )}
                                        </Droppable>
                                    </DragDropContext>

                                    {totalPages > 1 && (
                                        <div className="px-6 py-4 flex justify-between items-center text-sm text-on-surface-variant bg-surface-container-highest/30">
                                            <button 
                                                disabled={currentPage === 1} 
                                                onClick={() => setCurrentPage(p => p - 1)}
                                                className="px-3 py-1 border border-outline/20 rounded-md hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                                            >
                                                Previous
                                            </button>
                                            <span>Page {currentPage} of {totalPages}</span>
                                            <button 
                                                disabled={currentPage === totalPages} 
                                                onClick={() => setCurrentPage(p => p + 1)}
                                                className="px-3 py-1 border border-outline/20 rounded-md hover:bg-surface-container-high disabled:opacity-50 transition-colors"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {assignedSubjects.length > 0 && (
                        <div className="p-4 bg-surface-container-high border-t border-outline/20 flex justify-end">
                            <button 
                                onClick={handleSaveAssignments}
                                disabled={isSaving}
                                className="px-6 py-2 bg-primary text-on-primary rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-70 flex items-center gap-2"
                            >
                                {isSaving ? 'Saving...' : 'Save All Changes'}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add Subject Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl border border-outline/20 overflow-hidden">
                        <div className="p-6 border-b border-outline/20 flex justify-between items-center">
                            <h3 className="text-lg font-bold text-on-surface">Assign New Subject</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-on-surface-variant hover:text-on-surface">✕</button>
                        </div>
                        <form onSubmit={handleAddSubject} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Subjects *</label>
                                <div className="max-h-48 overflow-y-auto border border-outline/20 rounded-lg p-2 bg-surface-container space-y-1">
                                    {unassignedSubjects.map(sub => (
                                        <label key={sub.id} className="flex items-center gap-3 p-2 hover:bg-surface-container-high rounded cursor-pointer transition-colors">
                                            <input 
                                                type="checkbox" 
                                                value={sub.id}
                                                checked={newSubjectForm.subject_ids.includes(sub.id.toString())}
                                                onChange={(e) => {
                                                    const id = e.target.value;
                                                    if (e.target.checked) {
                                                        setNewSubjectForm({ ...newSubjectForm, subject_ids: [...newSubjectForm.subject_ids, id] });
                                                    } else {
                                                        setNewSubjectForm({ ...newSubjectForm, subject_ids: newSubjectForm.subject_ids.filter(sid => sid !== id) });
                                                    }
                                                }}
                                                className="w-4 h-4 text-primary bg-surface-container-highest border-outline/20 rounded focus:ring-primary focus:ring-offset-surface-container"
                                            />
                                            <span className="text-sm font-medium text-on-surface">{sub.name} <span className="text-xs text-on-surface-variant ml-1">({sub.category?.name || 'General'})</span></span>
                                        </label>
                                    ))}
                                    {unassignedSubjects.length === 0 && (
                                        <p className="text-xs text-yellow-500 p-2 text-center">All available subjects have been assigned.</p>
                                    )}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Assigned Teacher (Optional)</label>
                                <select
                                    value={newSubjectForm.staff_id}
                                    onChange={e => setNewSubjectForm({...newSubjectForm, staff_id: e.target.value})}
                                    className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-on-surface appearance-none"
                                >
                                    <option value="">No Teacher Assigned</option>
                                    {staffList.map(staff => (
                                        <option key={staff.id} value={staff.id}>
                                            {staff.user?.first_name || staff.first_name} {staff.user?.last_name || staff.last_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3 pt-2">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={newSubjectForm.is_compulsory}
                                        onChange={e => setNewSubjectForm({...newSubjectForm, is_compulsory: e.target.checked})}
                                    />
                                    <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                                    <span className="ml-3 text-sm font-medium text-on-surface-variant">Is Compulsory</span>
                                </label>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium">Cancel</button>
                                <button type="submit" disabled={newSubjectForm.subject_ids.length === 0} className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50">Add Selected</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Copy Modal */}
            {isCopyModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-surface-container-lowest w-full max-w-md rounded-2xl shadow-xl border border-outline/20 overflow-hidden">
                        <div className="p-6 border-b border-outline/20">
                            <h3 className="text-lg font-bold text-on-surface">Copy Assignments</h3>
                            <p className="text-sm text-on-surface-variant mt-1">Copy subjects and teacher assignments from another class arm in the same session.</p>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="p-3 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-sm">
                                ⚠️ Warning: This will overwrite any currently unsaved assignments in this class.
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-on-surface-variant mb-1">Copy From Class</label>
                                <select
                                    value={copyFromClassId}
                                    onChange={e => setCopyFromClassId(e.target.value)}
                                    className="w-full px-4 py-2 bg-surface-container rounded-lg border border-outline/20 text-on-surface appearance-none"
                                >
                                    <option value="">Select Class to copy from</option>
                                    {classes.filter(c => c.id.toString() !== selectedClassId).map(c => (
                                        <option key={c.id} value={c.id}>{c.full_name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setIsCopyModalOpen(false)} className="flex-1 px-4 py-2 bg-surface-container-high text-on-surface rounded-lg font-medium">Cancel</button>
                                <button onClick={handleCopyAssignments} disabled={!copyFromClassId} className="flex-1 px-4 py-2 bg-primary text-on-primary rounded-lg font-medium disabled:opacity-50">Confirm Copy</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
