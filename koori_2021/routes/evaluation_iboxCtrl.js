// Imports
const validationResults = require('../validationsResult')
const _ = require('lodash')
const models = require('../models');
let asyncLib = require('async');
const {Op} = require("sequelize");
module.exports = {
    createEvaluation_ibox: (req, res)=>{
        const idUser = parseInt(req.params.id);
        const idIbox = parseInt(req.params.id1);
        //return res.json({'ok': "ok"})
        asyncLib.waterfall([
            (callback1)=>{
                callback1(null,validationResults.error(req,res))
            },
            (errorResult, callback2)=>{
                if (!errorResult){
                    const {UserId, IboxId, evaluation} = req.body
                    models.EvaluationIbox.create({
                    UserId: idUser, IboxId: idIbox,evaluation
                    }).then((evaluation_kooriResult)=>{
                        callback2(null, evaluation_kooriResult)
                    }).catch((err)=>{
                        return res.status(500).json({'error':'Erreur dajout: '+ err})
                    })
                }
            },
        ],(err, result)=>{
            res.json(result);
        })
    },
    updateEvaluation_ibox :  (req, res) => {
        const {statut} = req.body
        const idUser = parseInt(req.params.id);
        const idIbox = parseInt(req.params.id1);
        // return res.json(FicheId)
        asyncLib.waterfall([
            (callback)=>{
                models.EvaluationIbox.findOne({
                    attributes: ['id', 'evaluation', 'UserId', 'IboxId'],
                    where: {[Op.and]: [{UserId: idUser}, {IboxId: idIbox}]},
                }).then(
                    (evaluation_kooriFound)=>{
                        callback(null, evaluation_kooriFound)
                    }
                ).catch((err)=>{
                    return res.status(500).json({'erreur serveur ': err});
                });
            },
            (evaluation_kooriFound,callback)=>{
                if (evaluation_kooriFound){
                    callback(null,evaluation_kooriFound, validationResults.error(req,res))
                }
            },
            (evaluation_kooriFound, validationResults, callback)=>{
                if (!validationResults){
                    evaluation_kooriFound.update({
                        statut:(statut? statut : evaluation_kooriFound.statut),
                    }).then((ficheResult)=>{
                        callback(null,ficheResult)
                    }).catch((err)=>{
                        res.status(500).json({'impossible de mettre a jour ': err.message});
                    })
                }
            }
        ], (err,result)=>{
            return res.status(201).json(result);
        })
    },
    getEvaluation_iboxByUserId :  (req, res) => {
        //return res.json({'ids': req.params.id1})
        const idUser = parseInt(req.params.id);
        const idIbox = parseInt(req.params.id1);
        models.EvaluationIbox.findOne({
                attributes: ['id', 'UserId', 'IboxId', 'evaluation'],
                include: [
                    {
                        model: models.Ibox,
                        attributes: ['id', 'description']
                    },
                    {
                        model: models.User,
                        attributes: ['id', 'nomComplet', 'email']
                    }
                ],
                where : {[Op.and]: [{UserId: idUser}, {IboxId: idIbox}]},
            }
        ).then((userEvaluation_koori)=>{
            if (userEvaluation_koori){
                res.status(200).json(userEvaluation_koori)
            }else {
                return null
            }
        })
            .catch((err)=>{
                return res.status(500).json({'error':'Erreur de récupération '+ err.message})
            })
    },
    getEvaluation_ibox :  (req, res) => {
        //return res.status(200).json({'ok':'oui'})
        models.EvaluationIbox.findAll({
                order: [['id', 'DESC']],
                include: [
                    {
                        model: models.User,
                        attributes: ['id', 'nomComplet']
                    }
                ]
            }
        ).then((Evaluation_ibox)=>{
            if (Evaluation_ibox){
                return res.status(200).json(Evaluation_ibox)
            }
            else {
                return null
            }
        })
            .catch((err)=>{
                return res.status(500).json({'Erreur de recuperation ':+ err.message})
            })
    }
}
