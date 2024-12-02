import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { api } from '../lib/api';  

const ProjectView = () => { 
  const [searchParams] = useSearchParams(); 
  const [project, setProject] = useState(null); 
  const [isEditing, setIsEditing] = useState(false); 
  const [isLoading, setIsLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [editForm, setEditForm] = useState({ 
    projectName: '', 
    description: '' 
  });  

  const deviceId = searchParams.get('deviceId');  

  useEffect(() => { 
    const fetchProject = async () => { 
      if (!deviceId) return; 
       
      try { 
        setIsLoading(true); 
        setError(null); 
        const data = await api.getProjectByDeviceId(deviceId); 
        setProject(data); 
        setEditForm({ 
          projectName: data.projectName, 
          description: data.description 
        }); 
      } catch (error) { 
        console.error('Error fetching project:', error); 
        setError('Failed to load project information'); 
      } finally { 
        setIsLoading(false); 
      } 
    };  

    fetchProject(); 
  }, [deviceId]);  

  const handleEdit = () => { 
    setIsEditing(true); 
  };  

  const handleCancel = () => { 
    setIsEditing(false); 
    setEditForm({ 
      projectName: project.projectName, 
      description: project.description 
    }); 
  };  

  const handleChange = (e) => { 
    const { name, value } = e.target; 
    setEditForm(prev => ({ 
      ...prev, 
      [name]: value 
    })); 
  };  

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    try { 
      const updatedProject = await api.updateProject(project.projectId, { 
        projectName: editForm.projectName, 
        description: editForm.description 
      }); 
       
      setProject(updatedProject); 
      setIsEditing(false); 
      // 성공 메시지나 알림을 추가할 수 있습니다 
    } catch (error) { 
      console.error('Failed to update project:', error); 
      // 에러 메시지를 표시할 수 있습니다 
    } 
  };  

  if (isLoading) { 
    return ( 
      <div className="max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[200px]"> 
        <div className="text-gray-500">Loading project information...</div> 
      </div> 
    ); 
  }  

  if (error) { 
    return ( 
      <div className="max-w-4xl mx-auto p-4"> 
        <div className="text-red-500">{error}</div> 
      </div> 
    ); 
  }  

  if (!project) { 
    return ( 
      <div className="max-w-4xl mx-auto p-4"> 
        <div className="text-gray-500">No project information available</div> 
      </div> 
    ); 
  }  

  return ( 
    <div className="max-w-4xl mx-auto p-4"> 
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg"> 
        <CardHeader className="border-b border-gray-100 bg-gray-50"> 
          <CardTitle className="flex items-center justify-between"> 
            <span className="text-gray-800 text-xl">Project Information</span> 
            {!isEditing && ( 
              <Button  
                onClick={handleEdit}  
                className="bg-blue-500 hover:bg-blue-600 transition-colors" 
              > 
                <span className="text-white">Edit</span> 
              </Button> 
            )} 
          </CardTitle> 
        </CardHeader> 
        <CardContent className="p-6"> 
          {isEditing ? ( 
            <form onSubmit={handleSubmit} className="space-y-4"> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label> 
                <input 
                  type="text" 
                  name="projectName" 
                  value={editForm.projectName} 
                  onChange={handleChange} 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white" 
                /> 
              </div> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label> 
                <textarea 
                  name="description" 
                  value={editForm.description} 
                  onChange={handleChange} 
                  rows="4" 
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white" 
                /> 
              </div> 
              <div className="flex justify-end gap-2 pt-4"> 
                <Button  
                  type="button"  
                  onClick={handleCancel} 
                  className="bg-gray-500 hover:bg-gray-600 transition-colors" 
                > 
                  <span className="text-white">Cancel</span> 
                </Button> 
                <Button  
                  type="submit" 
                  className="bg-blue-500 hover:bg-blue-600 transition-colors" 
                > 
                  <span className="text-white">Save</span> 
                </Button> 
              </div> 
            </form> 
          ) : ( 
            <div className="space-y-6"> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <h3 className="text-sm font-medium text-gray-700 mb-2">Project Name</h3> 
                <p className="text-lg text-gray-900">{project.projectName}</p> 
              </div> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3> 
                <p className="text-gray-900">{project.description}</p> 
              </div> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <h3 className="text-sm font-medium text-gray-700 mb-2">Device ID</h3> 
                <p className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block"> 
                  {deviceId} 
                </p> 
              </div> 
              <div className="bg-gray-50 p-4 rounded-lg"> 
                <h3 className="text-sm font-medium text-gray-700 mb-2">Created At</h3> 
                <p className="text-gray-900"> 
                  {new Date(project.createdAt).toLocaleString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })} 
                </p> 
              </div> 
            </div> 
          )} 
        </CardContent> 
      </Card> 
    </div> 
  ); 
};  

export default ProjectView;   
