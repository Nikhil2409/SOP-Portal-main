const Student = require('../models/Student');
const Project = require('../models/Project');
const { application } = require('express');

const getStudentDetails = async (req, res) => {
    try {
        const student = await Student.findById(req.user.mongoid);
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }
        return res.status(200).json({cgpa:student.cgpa,resume:student.resume});
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: error.message });
    }
}

const getAllprojects = async (req,res) => {
    try {
        const projects = await Project.find().populate('faculty');
        if(!projects){
            return res.status(404).json({message: 'No projects found'});
        }
        const new_projects = projects.map((project)=>{
            return {
                id: project._id,
                project_name: project.title,
                status: project.status,
                tags: project.tags.split(','),
                professor: project.faculty.name,
            }
        })
        return res.status(200).json(new_projects);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

const getProjectDescrition = async (req,res) => {
    try {
        const id = req.body.projectid;
        if(!id){
            return res.status(402).json({message:'project id not found'})
        }
        const project = await Project.findOne({_id:id})
        if(!project){
            return res.status(404).json({message:'project not found'})
        }
        return res.status(200).json({
            id: project._id,
            project_title: project.title,
            status: project.status,
            tags: project.tags.split(','),
            professor: project.faculty.name,
            date: project.date, 
            description:JSON.parse(project.description),
            gpsrn: project.gpsrn
        });
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

const applyForProject = async (req,res) => {
    try {
        const id = req.body.projectid;
        if(!id){
            return res.status(402).send('project id not found')
        }

        const project = await Project.findOne({_id:id})
        if(!project){
            return res.status(404).send('project not found')
        }

        const student = await Student.findById(req.user.mongoid);
        if(!student){
            return res.status(404).send('student not found')
        }

        if(!student.cgpa || !student.resume){
            return res.status(400).send('Please upload your details first');
        }

        // Check-and-insert in one atomic update so two quick clicks can't both apply.
        const updatedStudent = await Student.findOneAndUpdate(
            { _id: student._id, 'projects.id': { $ne: project._id } },
            { $push: { projects: { id: project._id, status: 'Pending' } } },
            { new: true }
        );
        if(!updatedStudent){
            return res.status(409).send('Student already applied for this project');
        }

        await Project.updateOne(
            { _id: project._id, 'students.id': { $ne: student._id } },
            { $push: { students: { id: student._id, status: 'Pending' } } }
        );

        return res.status(200).send('Applied for project successfully');
    } catch(error){
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

const uploadStudentDetails = async (req,res) => {
    try {
        const student = await Student.findById(req.user.mongoid);
        if(!student){
            return res.status(404).json({message: 'Student not found'});
        }
        student.cgpa = req.body.cgpa;
        student.resume = req.body.resume;
        await student.save();
        return res.status(200).json({message: 'Student details updated successfully'});
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

const getStudentProjects = async (req,res) => {
    try {
        const student = await Student.findById(req.user.mongoid);
        if(!student){
            return res.status(404).json({message: 'Student not found'});
        }
        const projects = student.projects;
        if(!projects){
            return res.status(404).json({message: 'No projects found'});
        }
        const new_projects = []
        for(let i=0;i<projects.length;i++){
            const project_obj = await Project.findById(projects[i].id);
            new_projects.push({
                title: project_obj.title,
                status: projects[i].status
            })
        }
        return res.status(200).json(new_projects);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error.message });
    }
}

module.exports = {getStudentDetails,getAllprojects,getProjectDescrition,applyForProject,uploadStudentDetails,getStudentProjects}